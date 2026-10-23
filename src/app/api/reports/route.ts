import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import { initModels } from '@/lib/models'
import { checkRateLimit } from '@/lib/trust/rateLimit'
import ContentReport, {
  type ContentReportReason,
  type ContentReportTargetType
} from '@/models/ContentReport'
import Post from '@/models/Post'
import { z } from 'zod'

const REPORTS_PER_DAY = 10
const DAY_MS = 24 * 60 * 60 * 1000

const createReportSchema = z.object({
  targetType: z.enum(['post', 'comment', 'user', 'message']),
  targetId: z.string().min(1),
  reason: z.enum(['spam', 'harassment', 'explicit', 'misinformation', 'other']),
  details: z.string().max(1000).optional()
})

export const POST = async (request: Request) => {
  try {
    await client()
    await initModels()

    const currentUser = await getCurrentUser()
    if (!currentUser?._id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const rateLimit = await checkRateLimit(
      `reports:user:${currentUser._id.toString()}`,
      REPORTS_PER_DAY,
      DAY_MS
    )
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Report limit reached. Try again later.' },
        { status: 429 }
      )
    }

    const body = createReportSchema.parse(await request.json())

    if (body.targetType === 'post') {
      const post = await Post.findById(body.targetId).select('_id').lean()
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }
    }

    const existing = await ContentReport.findOne({
      reporter: currentUser._id,
      targetType: body.targetType as ContentReportTargetType,
      targetId: body.targetId,
      status: 'open'
    }).lean()

    if (existing) {
      return NextResponse.json(
        { error: 'You already reported this content.' },
        { status: 409 }
      )
    }

    const report = await ContentReport.create({
      reporter: currentUser._id,
      targetType: body.targetType as ContentReportTargetType,
      targetId: body.targetId,
      reason: body.reason as ContentReportReason,
      details: body.details?.trim() || undefined,
      status: 'open'
    })

    return NextResponse.json({ success: true, reportId: report._id.toString() })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid report payload' },
        { status: 400 }
      )
    }
    console.error('Create report error:', error)
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    )
  }
}

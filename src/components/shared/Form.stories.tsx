import { zodResolver } from '@hookform/resolvers/zod'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import Button from '@/components/shared/Button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/shared/Form'
import Input from '@/components/shared/Input'

const demoSchema = z.object({
  email: z.string().email('Enter a valid email'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters')
})

type DemoValues = z.infer<typeof demoSchema>

const meta = {
  title: 'Compositions/Forms/Form',
  tags: ['autodocs']
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const DemoForm = () => {
  const form = useForm<DemoValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      email: '',
      displayName: ''
    },
    mode: 'onTouched'
  })

  return (
    <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-4">
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(() => {})}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@wraglet.com" {...field} />
                </FormControl>
                <FormDescription>
                  Used for account notifications.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="Wraglet Creator" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="default"
            size="default"
            className="w-full"
          >
            Save
          </Button>
        </form>
      </Form>
    </div>
  )
}

export const Default: Story = {
  render: () => <DemoForm />
}

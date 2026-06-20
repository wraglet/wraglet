'use client'

import React, { FC, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Gender, Pronoun } from '@/interfaces'
import { passwordSchema } from '@/lib/auth/passwordSchema'
import { authFormInputClassName } from '@/lib/authFormInputClassName'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import {
  GENDER_OPTIONS,
  GENDER_TO_DEFAULT_PRONOUN,
  PRONOUN_OPTIONS
} from '@/data/constants'
import { getValidationMessages } from '@/components/auth/password-validations'
import TurnstileWidget from '@/components/auth/TurnstileWidget'
import BirthdayPicker from '@/components/shared/BirthdayPicker'
import Button from '@/components/shared/Button'
import Checkbox from '@/components/shared/Checkbox'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/shared/Form'
import Input from '@/components/shared/Input'
import ListBox from '@/components/shared/ListBox'

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  dob: z.date({ required_error: 'Date of birth is required' }),
  gender: z.enum(GENDER_OPTIONS as [string, ...string[]]),
  pronoun: z.enum(PRONOUN_OPTIONS as [string, ...string[]]),
  publicProfileVisible: z.boolean(),
  agreeToTerms: z.boolean().refine((val) => val, 'You must agree to the terms'),
  website: z.string().max(0).optional()
})

type SignUpFormData = z.infer<typeof signUpSchema>

const SignUp: FC = () => {
  const router = useRouter()
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const turnstileRequired = Boolean(siteKey)
  const turnstileComplete = !turnstileRequired || Boolean(turnstileToken)

  const formMethods = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      dob: new Date(),
      gender: GENDER_OPTIONS[0],
      pronoun: PRONOUN_OPTIONS[0],
      publicProfileVisible: true,
      agreeToTerms: false,
      website: ''
    }
  })

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    setValue,
    register
  } = formMethods

  const selectedGender = useWatch({ control, name: 'gender' }) as Gender
  const selectedPronoun = useWatch({ control, name: 'pronoun' })

  React.useEffect(() => {
    const defaultPronounForGender = GENDER_TO_DEFAULT_PRONOUN[selectedGender]

    const defaultPronouns = Object.values(
      GENDER_TO_DEFAULT_PRONOUN
    ) as Pronoun[]
    const isCurrentPronounDefault = defaultPronouns.includes(
      selectedPronoun as Pronoun
    )

    if (
      isCurrentPronounDefault &&
      selectedPronoun !== defaultPronounForGender
    ) {
      setValue('pronoun', defaultPronounForGender)
    }
  }, [selectedGender, selectedPronoun, setValue])

  const mutation = useMutation({
    mutationFn: async (data: SignUpFormData) => {
      const { email, password, agreeToTerms, website, ...rest } = data
      if (!agreeToTerms) {
        throw new Error('You must agree to the terms')
      }
      const formData = {
        ...rest,
        email: email.toLowerCase(),
        password,
        turnstileToken,
        website: website ?? ''
      }

      const response = await axios.post('/api/register', formData)
      return response.data as { message: string; email: string }
    },
    onSuccess: (data, variables) => {
      toast.success(
        data.message ?? 'Check your email to activate your account.'
      )
      const email = encodeURIComponent(
        data.email ?? variables.email.trim().toLowerCase()
      )
      router.replace(`/verify-email?email=${email}`)
    },
    onError: (error: unknown) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? String(error.response.data.error)
          : 'Something went wrong while signing up.'
      toast.error(message)
    }
  })

  const newPassword = useWatch({ control, name: 'password' }) ?? ''

  const onSubmit = (data: SignUpFormData) => {
    if (turnstileRequired && !turnstileToken) {
      toast.error('Complete the security check first.')
      return
    }
    mutation.mutate(data)
  }

  return (
    <FormProvider {...formMethods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4"
      >
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          {...register('website')}
        />
        <div className="flex flex-col gap-2 md:flex-row">
          <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/2">
                <FormControl>
                  <Input
                    placeholder="First name"
                    type="text"
                    className={authFormInputClassName}
                    error={errors.firstName?.message}
                    {...field}
                  />
                </FormControl>
                {errors.firstName && (
                  <FormMessage>{errors.firstName.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/2">
                <FormControl>
                  <Input
                    placeholder="Last name"
                    type="text"
                    className={authFormInputClassName}
                    error={errors.lastName?.message}
                    {...field}
                  />
                </FormControl>
                {errors.lastName && (
                  <FormMessage>{errors.lastName.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Email"
                  type="email"
                  className={authFormInputClassName}
                  error={errors.email?.message}
                  {...field}
                />
              </FormControl>
              {errors.email && (
                <FormMessage>{errors.email.message}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Password"
                  type="password"
                  className={authFormInputClassName}
                  error={errors.password?.message}
                  {...field}
                />
              </FormControl>
              {getValidationMessages(newPassword) && (
                <ul className="mt-2 flex flex-col gap-y-1 text-sm">
                  {getValidationMessages(newPassword)?.map((message) => (
                    <li
                      key={message}
                      className={
                        message.startsWith('✔️')
                          ? 'text-green-500'
                          : 'text-red-500'
                      }
                    >
                      {message}
                    </li>
                  ))}
                </ul>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="dob"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <BirthdayPicker
                  dateSetter={field.onChange}
                  date={field.value}
                />
              </FormControl>
              {errors.dob && <FormMessage>{errors.dob.message}</FormMessage>}
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2 md:flex-row">
          <FormField
            control={control}
            name="gender"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/2">
                <FormControl>
                  <ListBox
                    label="Gender"
                    options={GENDER_OPTIONS}
                    setSelected={field.onChange}
                    selected={field.value}
                  />
                </FormControl>
                {errors.gender && (
                  <FormMessage>{errors.gender.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="pronoun"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/2">
                <FormControl>
                  <ListBox
                    label="Pronoun"
                    options={PRONOUN_OPTIONS}
                    setSelected={field.onChange}
                    selected={field.value}
                  />
                </FormControl>
                {errors.pronoun && (
                  <FormMessage>{errors.pronoun.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
        </div>
        <div className="my-2 border-t border-solid border-[#E3F1FA]/70" />
        <div className="flex flex-col gap-2">
          <h3 className="mb-1 text-sm text-slate-600">Privacy Settings</h3>
          <FormField
            control={control}
            name="publicProfileVisible"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      label="Public Profile"
                      id="publicProfile"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                </FormControl>
                {errors.publicProfileVisible && (
                  <FormMessage>
                    {errors.publicProfileVisible.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />
        </div>
        <div className="my-2 border-t border-solid border-[#E3F1FA]/70" />
        <div className="flex flex-col gap-2">
          <h3 className="mb-1 text-sm text-slate-600">
            <span>By signing up, you agree to our </span>
            <Link
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0EA5E9] underline hover:text-[#42BBFF]"
            >
              Terms of Service
            </Link>
            <span> and </span>
            <Link
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0EA5E9] underline hover:text-[#42BBFF]"
            >
              Privacy Policy
            </Link>
            .
          </h3>
          <FormField
            control={control}
            name="agreeToTerms"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      label="I agree to the Terms of Service and Privacy Policy"
                      id="termsOfServiceAndPrivacyPolicy"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                </FormControl>
                {errors.agreeToTerms && (
                  <FormMessage>{errors.agreeToTerms.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
        </div>
        <TurnstileWidget
          onSuccess={setTurnstileToken}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setTurnstileToken(null)}
        />
        <div className="mt-4 flex w-full items-center justify-center border-t border-solid border-[#E3F1FA]/70 pt-4">
          <Button
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#42BBFF] to-[#0EA5E9] py-2.5 text-base font-semibold text-white shadow-lg transition-all hover:from-[#0EA5E9] hover:to-[#42BBFF] focus:ring-2 focus:ring-[#0EA5E9] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={!isValid || mutation.isPending || !turnstileComplete}
          >
            <span className="flex items-center gap-2">
              {mutation.isPending ? 'Signing up...' : 'Sign Up'}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-10a4 4 0 11-8 0 4 4 0 018 0zm6 6v-2a4 4 0 00-3-3.87"
                />
              </svg>
            </span>
            <span className="group-active:animate-ripple pointer-events-none absolute inset-0 rounded-xl bg-white/20" />
          </Button>
        </div>
        <div className="mt-2 flex w-full items-center justify-center">
          <Link
            href="/"
            className="text-sm font-medium text-[#0EA5E9] transition-colors hover:underline focus:underline"
          >
            Already have an account?{' '}
            <span className="font-semibold">Log in!</span>
          </Link>
        </div>
      </form>
    </FormProvider>
  )
}

export default SignUp

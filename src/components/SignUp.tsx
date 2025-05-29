'use client'

import { FC } from 'react'
import { signIn } from 'next-auth/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import { getValidationMessages } from '@/components/auth/password-validations'
import BirthdayPicker from '@/components/BirthdayPicker'
import Checkbox from '@/components/Checkbox'
import ListBox, { ListProps } from '@/components/ListBox'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const friendRequestsOptions: ListProps[] = [
  { val: 'everyone', name: 'Everyone' },
  { val: 'friendsOfFriends', name: 'Friends of Friends' },
  { val: 'noOne', name: 'No One' }
]

const genderOptions: string[] = ['Female', 'Male', 'Others']
const pronounOptions: string[] = ['She/Her', 'He/Him', 'They/Them']

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(
      /[@$!%*?&#]/,
      'Password must contain at least one special character'
    ),
  dob: z.date({ required_error: 'Date of birth is required' }),
  gender: z.enum(genderOptions as [string, ...string[]]),
  pronoun: z.enum(pronounOptions as [string, ...string[]]),
  publicProfileVisible: z.boolean(),
  agreeToTerms: z.boolean().refine((val) => val, 'You must agree to the terms')
})

type SignUpFormData = z.infer<typeof signUpSchema>

const SignUp: FC = () => {
  const formMethods = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      dob: new Date(),
      gender: genderOptions[0],
      pronoun: pronounOptions[0],
      publicProfileVisible: true,
      agreeToTerms: false
    }
  })

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch
  } = formMethods

  const mutation = useMutation({
    mutationFn: async (data: SignUpFormData) => {
      const { email, ...rest } = data
      const formData = {
        ...rest,
        email: email.toLowerCase()
      }

      try {
        const response = await axios.post('/api/register', formData)

        if (response.status !== 200) {
          throw new Error('Network response was not ok')
        }
        return response.data
      } catch (error) {
        console.error('Error during registration request:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('data: ', data)
      signIn('credentials', {
        email: formMethods.getValues('email').toLowerCase(),
        password: formMethods.getValues('password')
      })
      toast.success('Account created successfully!')
    },
    onError: (error) => {
      console.error('Error while signing up:', error)
      toast.error('Something went wrong while signing up!')
    }
  })

  const newPassword = watch('password')

  const onSubmit = (data: SignUpFormData) => {
    mutation.mutate(data)
  }

  return (
    <FormProvider {...formMethods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4"
      >
        <div className="flex gap-2">
          <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="w-1/2">
                <FormControl>
                  <Input
                    placeholder="First name"
                    type="text"
                    className="relative w-full cursor-default appearance-none rounded-lg border border-neutral-200 bg-white py-2 pr-3 pl-3 text-left shadow-md focus:outline-hidden focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
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
              <FormItem className="w-1/2">
                <FormControl>
                  <Input
                    placeholder="Last name"
                    type="text"
                    className="relative w-full cursor-default appearance-none rounded-lg border border-neutral-200 bg-white py-2 pr-3 pl-3 text-left shadow-md focus:outline-hidden focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
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
                  className="relative w-full cursor-default appearance-none rounded-lg border border-neutral-200 bg-white py-2 pr-3 pl-3 text-left shadow-md focus:outline-hidden focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
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
                  className="relative w-full cursor-default appearance-none rounded-lg border border-neutral-200 bg-white py-2 pr-10 pl-3 text-left shadow-md focus:outline-hidden focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
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
        <div className="flex gap-2">
          <FormField
            control={control}
            name="gender"
            render={({ field }) => (
              <FormItem className="w-1/2">
                <FormControl>
                  <ListBox
                    label="Gender"
                    options={genderOptions}
                    setSelected={field.onChange}
                    selected={field.value}
                    className="h-12 rounded-xl border border-neutral-200 bg-white/80 px-4 py-3.5 text-lg focus:border-[#42BBFF] focus:ring-2 focus:ring-[#0EA5E9] focus:outline-none"
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
              <FormItem className="w-1/2">
                <FormControl>
                  <ListBox
                    label="Pronoun"
                    options={pronounOptions}
                    setSelected={field.onChange}
                    selected={field.value}
                    className="h-12 rounded-xl border border-neutral-200 bg-white/80 px-4 py-3.5 text-lg focus:border-[#42BBFF] focus:ring-2 focus:ring-[#0EA5E9] focus:outline-none"
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
          <h3 className="font-geist-sans mb-1 text-sm text-slate-600">
            Privacy Settings
          </h3>
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
          <h3 className="font-geist-sans mb-1 text-sm text-slate-600">
            Terms of Service and Privacy Policy
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
        <div className="mt-4 flex w-full items-center justify-center border-t border-solid border-[#E3F1FA]/70 pt-4">
          <Button
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#42BBFF] to-[#0EA5E9] py-3 text-lg font-semibold text-white shadow-lg transition-all hover:from-[#0EA5E9] hover:to-[#42BBFF] focus:ring-2 focus:ring-[#0EA5E9]"
            type="submit"
            disabled={!isValid}
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
      </form>
    </FormProvider>
  )
}

export default SignUp

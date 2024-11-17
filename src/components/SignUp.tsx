'use client'

import React, { FC } from 'react'
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
  friendRequestsVal: z.object({ val: z.string(), name: z.string() }),
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
      friendRequestsVal: friendRequestsOptions[0],
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
      const { friendRequestsVal, ...rest } = data
      const formData = {
        ...rest,
        friendRequests: friendRequestsVal.val
      }

      console.log('Sending formData:', formData)

      try {
        const response = await axios.post('/api/register', formData)
        console.log('Response status:', response.status)
        console.log('Response data:', response.data)

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
        email: formMethods.getValues('email'),
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-y-4 p-5">
          <div className="flex space-x-2">
            <FormField
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="First name" type="text" {...field} />
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
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Last name"
                      type="text"
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
                    error={errors.password?.message}
                    {...field}
                  />
                </FormControl>
                {getValidationMessages(newPassword) && (
                  <ul className="flex flex-col gap-y-1 text-sm">
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
          <div className="flex flex-1 space-x-2">
            <FormField
              control={control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ListBox
                      label="Gender"
                      options={genderOptions}
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
                <FormItem>
                  <FormControl>
                    <ListBox
                      label="Pronoun"
                      options={pronounOptions}
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
          <div className="flex items-center">
            <div className="flex flex-1 flex-col items-start">
              <h3 className="mb-4 pl-1 text-sm text-slate-600">
                Privacy Settings
              </h3>
              <div className="mb-1 pl-1">
                <FormField
                  control={control}
                  name="publicProfileVisible"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Checkbox
                          label="Public Profile"
                          id="publicProfile"
                          checked={field.value}
                          onChange={field.onChange}
                        />
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
            </div>
            <div className="flex flex-1 flex-col">
              <FormField
                control={control}
                name="friendRequestsVal"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ListBox
                        label="Friend Requests"
                        options={friendRequestsOptions}
                        setSelected={(name) => {
                          const selectedOption = friendRequestsOptions.find(
                            (option) => option.name === name
                          )
                          if (selectedOption) {
                            field.onChange(selectedOption)
                          }
                        }}
                        selected={field.value.name}
                      />
                    </FormControl>
                    {errors.friendRequestsVal && (
                      <FormMessage>
                        {errors.friendRequestsVal.message}
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="mb-0.5 pl-1 text-sm text-slate-600">
              Terms of Service and Privacy Policy
            </h3>
            <div className="pl-1">
              <FormField
                control={control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Checkbox
                        label="I agree to the Terms of Service and Privacy Policy"
                        id="termsOfServiceAndPrivacyPolicy"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    {errors.agreeToTerms && (
                      <FormMessage>{errors.agreeToTerms.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-center border-t border-solid border-[#DFE4EA] p-5">
          <Button
            className="w-full rounded bg-[#42BBFF] py-2 text-base font-medium text-white"
            type="submit"
            disabled={!isValid}
          >
            {mutation.isPending ? 'Signing up...' : 'Sign Up'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default SignUp

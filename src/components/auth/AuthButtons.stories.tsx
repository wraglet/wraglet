import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import AuthButtons from '@/components/auth/AuthButtons'

const meta = {
  title: 'Features/Auth/AuthButtons',
  component: AuthButtons,
  tags: ['autodocs']
} satisfies Meta<typeof AuthButtons>

export default meta

type Story = StoryObj<typeof meta>

export const OnLoginPage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/'
      }
    }
  }
}

export const OnRegisterPage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/register'
      }
    }
  }
}

export const OnAppPage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/feed'
      }
    }
  }
}

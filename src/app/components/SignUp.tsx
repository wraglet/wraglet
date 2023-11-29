'use client';
import React, { FC, useReducer, FormEvent } from 'react';
import BirthdayPicker from './BirthdayPicker';
import ListBox, { ListProps } from './ListBox';
import Input from './Input';
import Checkbox from './Checkbox';
import Button from './Button';
import { signIn } from 'next-auth/react';
import axios from 'axios';
import toast from 'react-hot-toast';

const friendRequestsOptions: ListProps[] = [
  { val: 'everyone', name: 'Everyone' },
  { val: 'friendsOfFriends', name: 'Friends of Friends' },
  { val: 'noOne', name: 'No One' }
];

const genderOptions: string[] = ['Female', 'Male', 'Others'];
const pronounOptions: string[] = ['She/Her', 'He/Him', 'They/Them'];

const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  dob: '',
  gender: genderOptions[0],
  pronoun: pronounOptions[0],
  friendRequestsVal: friendRequestsOptions[0],
  publicProfileVisible: true,
  agreeToTerms: false,
  isLoading: false
};

const SignUp: FC = () => {
  const reducer = (state: any, action: any) => ({ ...state, ...action });
  const [
    {
      firstName,
      lastName,
      email,
      password,
      dob,
      gender,
      pronoun,
      friendRequestsVal,
      publicProfileVisible,
      agreeToTerms,
      isLoading
    },
    dispatchState
  ] = useReducer(reducer, initialState);

  console.table({
    firstName,
    lastName,
    email,
    password,
    dob,
    gender,
    pronoun,
    friendRequestsVal,
    publicProfileVisible,
    agreeToTerms
  });

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const friendRequests = friendRequestsVal.val;

    const formData = {
      firstName,
      lastName,
      email,
      password,
      dob,
      gender,
      pronoun,
      friendRequests,
      publicProfileVisible,
      agreeToTerms
    };

    // axios
    //   .post('/api/register', formData)
    //   .then(() => signIn('credentials', { email, password }))
    //   .catch(() => toast.error('Something went wrong!'))
    //   .finally(() => dispatchState({ isLoading: false }));

    try {
      dispatchState({ isLoading: true });
      await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      signIn('credentials', { email, password });
    } catch {
      toast.error('Something went wrong!');
    } finally {
      dispatchState({ isLoading: false });
    }
  };
  return (
    <form onSubmit={handleSignUp}>
      <div className='flex flex-col gap-y-4 p-5'>
        <div className='flex space-x-2'>
          <Input
            value={firstName}
            onChange={(e) => dispatchState({ firstName: e.target.value })}
            placeholder='First name'
            type='text'
          />
          <Input
            value={lastName}
            onChange={(e) => dispatchState({ lastName: e.target.value })}
            placeholder='Last name'
            type='text'
          />
        </div>
        <Input
          value={email}
          onChange={(e) => dispatchState({ email: e.target.value })}
          placeholder='Email'
          type='email'
        />
        <Input
          value={password}
          onChange={(e) => dispatchState({ password: e.target.value })}
          placeholder='Password'
          type='password'
        />
        <BirthdayPicker
          date={dob}
          dateSetter={(val) => dispatchState({ dob: val })}
        />
        <div className='flex flex-1 space-x-2'>
          <ListBox
            label='Gender'
            options={genderOptions}
            selected={gender}
            setSelected={(val) => dispatchState({ gender: val })}
          />
          <ListBox
            label='Pronoun'
            options={pronounOptions}
            selected={pronoun}
            setSelected={(val) => dispatchState({ pronoun: val })}
          />
        </div>
        <div className='flex items-center'>
          <div className='flex flex-col flex-1 items-start'>
            <h3 className='pl-1 text-sm mb-4 text-slate-600'>
              Privacy Settings
            </h3>
            <div className='pl-1 mb-1'>
              <Checkbox
                label='Public Profile'
                id='publicProfile'
                onChange={(e) =>
                  dispatchState({ publicProfileVisible: e.target.checked })
                }
                checked={publicProfileVisible}
              />
            </div>
          </div>
          <div className='flex flex-col flex-1'>
            <ListBox
              label='Friend Requests'
              options={friendRequestsOptions}
              setSelected={(val) => dispatchState({ friendRequests: val })}
              selected={friendRequestsVal}
            />
          </div>
        </div>

        <div className='flex flex-col'>
          <h3 className='mb-0.5 pl-1 text-sm text-slate-600'>
            Terms of Service and Privacy Policy
          </h3>
          <div className='pl-1'>
            <Checkbox
              onChange={(e) =>
                dispatchState({ agreeToTerms: e.target.checked })
              }
              checked={agreeToTerms}
              label='I agree to the Terms of Service and Privacy Policy'
              id='termsOfServiceAndPrivacyPolicy'
            />
          </div>
        </div>
      </div>
      <div className='flex items-center w-full justify-center border-t border-solid border-[#DFE4EA] p-5'>
        <Button
          className='w-full bg-[#42BBFF] text-base font-medium py-2 rounded text-white'
          type='submit'
        >
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </Button>
      </div>
    </form>
  );
};

export default SignUp;

'use client';
import React, { useState, MouseEvent, FC } from 'react';
import BirthdayPicker from './BirthdayPicker';
import ListBox, { ListProps } from './ListBox';
import Input from './Input';
import Checkbox from './Checkbox';
import Button from './Button';

const friendRequestsOptions: ListProps[] = [
  { val: 'everyone', name: 'Everyone' },
  { val: 'friendsOfFriends', name: 'Friends of Friends' },
  { val: 'noOne', name: 'No One' }
];

const genderOptions: string[] = ['Female', 'Male', 'Others'];
const pronounOptions: string[] = ['She/Her', 'He/Him', 'They/Them'];

const SignUp: FC = () => {
  const [publicProfile, setPublicProfile] = useState(true);
  const [friendRequests, setFriendRequests] = useState(
    friendRequestsOptions[0]
  );

  const [gender, setGender] = useState(genderOptions[0]);
  const [pronoun, setPronoun] = useState(pronounOptions[0]);

  const handleFriendRequestsChange = (val: string | ListProps) => {
    setFriendRequests(val as ListProps);
  };

  const handleGenderChange = (val: string | ListProps) => {
    setGender(val as string);
  };

  const handlePronounChange = (val: string | ListProps) => {
    setPronoun(val as string);
  };

  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSignUp = (e: MouseEvent<HTMLSpanElement>) => {};
  return (
    <>
      <div className='flex flex-col gap-y-4 p-5'>
        <div className='flex space-x-2'>
          <Input placeholder='First name' type='text' />
          <Input placeholder='Last name' type='text' />
        </div>
        <Input placeholder='Email' type='email' />
        <Input placeholder='Password' type='password' />
        <BirthdayPicker />
        <div className='flex flex-1 space-x-2'>
          <ListBox
            label='Gender'
            options={genderOptions}
            selected={gender}
            setSelected={handleGenderChange}
          />
          <ListBox
            label='Pronoun'
            options={pronounOptions}
            selected={pronoun}
            setSelected={handlePronounChange}
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
                onChange={() => setPublicProfile(!publicProfile)}
                checked={publicProfile}
              />
            </div>
          </div>
          <div className='flex flex-col flex-1'>
            <ListBox
              label='Friend Requests'
              options={friendRequestsOptions}
              setSelected={handleFriendRequestsChange}
              selected={friendRequests}
            />
          </div>
        </div>

        <div className='flex flex-col'>
          <h3 className='mb-0.5 pl-1 text-sm text-slate-600'>
            Terms of Service and Privacy Policy
          </h3>
          <div className='pl-1'>
            <Checkbox
              onChange={() => setAgreeToTerms(!agreeToTerms)}
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
          Sign Up
        </Button>
      </div>
    </>
  );
};

export default SignUp;

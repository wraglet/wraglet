'use client';
import CreatePost from '@/components/CreatePost';
import axios from 'axios';
import React, { FormEvent, useReducer, useState } from 'react';
import toast from 'react-hot-toast';
import { useChannel } from 'ably/react';
import Post from '@/components/Post';
import { PostDocument } from '@/models/Post';
import { useDispatch, useSelector } from 'react-redux';
import { setFeedPosts } from '@/libs/redux/features/feedPostsSlice';
import { PostInterface } from '@/interfaces';
import { RootState } from '@/libs/redux/store';

type Props = {
  initialPosts: PostDocument[];
};

const ProfileBody = ({ initialPosts }: Props) => {
  const reducer = (state: any, action: any) => ({ ...state, ...action });

  const feedPosts = useSelector(
    (state: RootState) => state.feedPostsState.posts
  );

  const dispatch = useDispatch();

  const [posts, setPosts] = useState<PostInterface[]>(initialPosts);

  const initialState = {
    text: '',
    image: null,
    isLoading: false
  };

  const [{ text, image, isLoading }, dispatchState] = useReducer(
    reducer,
    initialState
  );

  const { channel } = useChannel('post-channel');

  const submitPost = async (e: FormEvent) => {
    e.preventDefault();

    dispatchState({ isLoading: true });

    axios
      .post('/api/posts', { text, image })
      .then((res: any) => {
        channel.publish({
          name: 'post',
          data: res.data
        });

        dispatch(setFeedPosts([res.data, ...feedPosts]));

        setPosts((posts: PostInterface[]) => [res.data, ...posts]);
      })
      .catch(() => toast.error('An error occurred when creating a post'))
      .finally(() =>
        dispatchState({ isLoading: false, text: '', image: null })
      );
  };
  return (
    <div className='flex gap-x-10 items-start w-full xl:w-[1250px] tablet:px-5 lg:px-10 xl:px-0 mb-6'>
      <div className='hidden tablet:flex flex-col tablet:w-2/5 rounded-lg drop-shadow-md bg-white border border-solid border-neutral-200 h-[500px]' />
      <div className='md:w-[680px] md:mx-auto sm:mx-10 flex gap-y-4 flex-col w-full tablet:flex-grow'>
        <CreatePost
          isLoading={isLoading}
          submitPost={submitPost}
          text={text}
          setText={(e) => dispatchState({ text: e.target.value })}
          postImage={image}
          setPostImage={(image) => dispatchState({ image: image })}
        />
        {posts.map((post: PostInterface) => (
          <Post key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default ProfileBody;

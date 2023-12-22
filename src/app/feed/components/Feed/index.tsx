'use client';

import React, { FC, FormEvent, useEffect, useReducer, useState } from 'react';
import CreatePost from '@/components/CreatePost';
import Post from '@/components/Post';
import { useChannel } from 'ably/react';

import toast from 'react-hot-toast';
import axios from 'axios';
import { PostDocument } from '@/models/Post';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/libs/redux/store';
import {
  setFeedPosts,
  setIsFeedPostsInitialized
} from '@/libs/redux/features/feedPostsSlice';
import { PostInterface } from '@/interfaces';

interface FeedBodyInterface {
  initialPosts: PostDocument[];
}

const FeedBody: FC<FeedBodyInterface> = ({ initialPosts }) => {
  const [hydrated, setHydrated] = useState(false);
  const reducer = (state: any, action: any) => ({ ...state, ...action });

  const dispatch = useDispatch();
  const { posts, isFeedPostsInitialized } = useSelector(
    (state: RootState) => state.feedPostsState
  );

  useEffect(() => {
    if (!isFeedPostsInitialized) {
      dispatch(setFeedPosts(initialPosts));
      dispatch(setIsFeedPostsInitialized(true));
    }
  }, [dispatch, initialPosts, isFeedPostsInitialized]);

  const initialState = {
    text: '',
    image: null,
    isLoading: false
  };

  const [{ text, image, isLoading }, dispatchState] = useReducer(
    reducer,
    initialState
  );

  const { channel } = useChannel('post-channel', (post) => {
    dispatch(setFeedPosts([post.data].concat(posts)));
  });

  const submitPost = async (e: FormEvent) => {
    e.preventDefault();

    dispatchState({ isLoading: true });

    axios
      .post('/api/posts', { text, image })
      .then((res: any) => {
        console.log('response: ', res.data);
        channel.publish({
          name: 'post',
          data: res.data
        });
      })
      .catch(() => toast.error('An error occurred when creating a post'))
      .finally(() =>
        dispatchState({ isLoading: false, text: '', image: null })
      );
  };

  useEffect(() => {
    // This forces a rerender, so the date is rendered
    // the second time but not the first
    setHydrated(true);
  }, []);
  if (!hydrated) {
    // Returns null on first render, so the client and server match
    return null;
  }

  return (
    <section className='flex justify-center flex-grow h-auto my-6 mx-auto'>
      <div className='2xl:w-[680px] xl:w-[600px] flex gap-y-4 flex-col w-full'>
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
    </section>
  );
};

export default FeedBody;

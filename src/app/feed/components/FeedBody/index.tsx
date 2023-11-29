'use client';

import React, { FC, FormEvent, useReducer, useState } from 'react';
import CreatePost from './component/CreatePost';
import Post from './component/Post';
import { PostInterface } from '@/app/interfaces';
// import { useChannel } from 'ably/react';

import toast from 'react-hot-toast';
import axios from 'axios';

interface FeedBodyInterface {
  initialPosts: PostInterface[];
}

const FeedBody: FC<FeedBodyInterface> = ({ initialPosts }) => {
  const reducer = (state: any, action: any) => ({ ...state, ...action });

  const [posts, setPosts] = useState<PostInterface[]>(initialPosts);

  const initialState = {
    content: '',
    isLoading: false
  };

  const [{ content, isLoading }, dispatch] = useReducer(reducer, initialState);

  // const { channel } = useChannel('post-channel', (post) => {
  //   setPosts((posts: PostInterface[]) => [post.data, ...posts]);
  // });

  const submitPost = async (e: FormEvent) => {
    e.preventDefault();

    dispatch({ isLoading: true });

    axios
      .post('/api/posts', { content })
      .then((res: any) => {
        console.log('response: ', res.data);
        // channel.publish({
        //   name: 'post',
        //   data: res.data
        // });
      })
      .catch(() => toast.error('An error occurred when creating a post'))
      .finally(() => dispatch({ isLoading: false, content: '' }));
  };

  return (
    <section className='col-start-3 col-end-8 h-auto flex flex-col mt-6 w-full gap-y-4 overflow-auto'>
      <CreatePost
        isLoading={isLoading}
        submitPost={submitPost}
        content={content}
        setContent={(e) => dispatch({ content: e.target.value })}
      />
      {posts.map((post: PostInterface) => (
        <Post key={post.id} post={post} />
      ))}
    </section>
  );
};

export default FeedBody;

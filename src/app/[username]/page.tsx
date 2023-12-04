import React from 'react';

interface IPrams {
  username: string;
}

const ProfilePage = ({ params }: { params: IPrams }) => {
  const { username } = params;
  console.log('Username: ', username);
  return <div>ProfilePage {username}</div>;
};

export default ProfilePage;

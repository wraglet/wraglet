import { getServerSession } from 'next-auth';
import { authOptions } from '../utils/authOptions';

export default async function GetSession() {
  return await getServerSession(authOptions);
}

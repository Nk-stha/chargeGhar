import styles from './userDetails.module.css';

interface UserDetailsPageProps {
  params: { id: string[] };
}

const UserDetailsPage: React.FC<UserDetailsPageProps> = ({ params }) => {
  const userId = params.id.join('/');
  return (
    <div className={styles.container}>
      <h1>User Details for ID: {userId}</h1>
      <p>This is a placeholder for user details.</p>
    </div>
  );
};

export default UserDetailsPage;

'use client';
const Footer = () => {
  return (
    <footer className='h-[50px] w-full flex items-center justify-center gap-[50px] text-xs font-medium z-20 bg-white'>
      <h3>About</h3>
      <h3>Help</h3>
      <h3>Terms of Service</h3>
      <h3>Privacy Policy</h3>
      <h3>Cookie Policy</h3>
      <h3>Advertising</h3>
      <h3>&copy; {new Date().getFullYear()} Wraglet</h3>
    </footer>
  );
};

export default Footer;

const getLimit = () => {
  if (typeof window === 'undefined') return 20
  const width = window.innerWidth
  if (width < 768) return 10 // mobile
  return 20 // tablet/desktop
}

export default getLimit

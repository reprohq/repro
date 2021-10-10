export const formatDate = (value: number, precision: 'seconds' | 'millis') => {
  const minutes = value / 60000 | 0
  const seconds = (value - (minutes * 60000)) / 1000 | 0
  let output = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  if (precision === 'millis') {
    const millis = value - (minutes * 60000) - (seconds * 1000)
    output += `.${millis.toString().padStart(3, '0')}`
  }

  return output
}

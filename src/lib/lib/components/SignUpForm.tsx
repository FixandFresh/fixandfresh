import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export const SignUpForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else console.log('Sign-up success:', data)
  }

  return (
    <div>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleSignUp}>Sign Up</button>
      {error && <p>{error}</p>}
    </div>
  )
}

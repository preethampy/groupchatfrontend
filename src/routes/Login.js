import React from 'react'
import AuthCard from '../components/AuthCard';

/**
 * @returns AuthCard function component which takes the type prop (which is login at this point) and returns login page.
 */

export default function Login() {
  return <>
    <AuthCard type="login"/>
  </>
}

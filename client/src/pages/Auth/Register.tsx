import { TentTree } from 'lucide-react';

export default function Register() {
  return (
    <fieldset className="fieldset w-xs rounded-box border border-base-200 p-4 shadow-lg">
      <TentTree className="mx-auto text-primary-500" size={60} />

      <label className="label">Email</label>
      <input type="email" className="input" placeholder="Email" />

      <label className="label">Password</label>
      <input type="password" className="input" placeholder="Password" />

      <button className="btn mt-4 btn-neutral">Login</button>
    </fieldset>
  );
}

import { ProfileStudio } from './ProfileStudio'

export function EditProfile() {
  return <ProfileStudio mode="edit" />
}

export function CreateProfile() {
  return <ProfileStudio mode="create" />
}

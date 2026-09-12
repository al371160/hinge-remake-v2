import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { GameSendSheet } from '../components/GameSendSheet'
import { GameOverlay } from '../games/GameOverlay'
import { PhoneFrame } from '../components/PhoneFrame'
import { TabBar } from '../components/TabBar'
import { Toast } from '../components/Toast'
import { Chat } from '../screens/Chat'
import { ChatProfile } from '../screens/ChatProfile'
import { DateReviewScreen } from '../screens/DateReview'
import { DatesLog } from '../screens/DatesLog'
import { Discover } from '../screens/Discover'
import { CreateProfile, EditProfile } from '../screens/EditProfile'
import { LikesYou } from '../screens/LikesYou'
import { Matches } from '../screens/Matches'
import { PreviewProfile } from '../screens/PreviewProfile'
import { ProfileHub } from '../screens/ProfileHub'
import { Standouts } from '../screens/Standouts'

export function AppShell() {
  const { pathname } = useLocation()
  const hideTab =
    pathname.startsWith('/matches/') ||
    pathname === '/you/edit' ||
    pathname === '/you/create' ||
    pathname === '/you/preview' ||
    pathname === '/you/dates'

  return (
    <PhoneFrame>
      <div className="relative flex h-full flex-col pt-11">
        <div className="relative min-h-0 flex-1">
          <Routes>
            <Route path="/" element={<Discover />} />
            <Route path="/standouts" element={<Standouts />} />
            <Route path="/likes" element={<LikesYou />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/:threadId" element={<Chat />} />
            <Route path="/matches/:threadId/profile" element={<ChatProfile />} />
            <Route path="/matches/:threadId/review" element={<DateReviewScreen />} />
            <Route path="/you" element={<ProfileHub />} />
            <Route path="/you/edit" element={<EditProfile />} />
            <Route path="/you/create" element={<CreateProfile />} />
            <Route path="/you/preview" element={<PreviewProfile />} />
            <Route path="/you/dates" element={<DatesLog />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toast />
        </div>
        {!hideTab && <TabBar />}
        <GameOverlay />
        <GameSendSheet />
      </div>
    </PhoneFrame>
  )
}

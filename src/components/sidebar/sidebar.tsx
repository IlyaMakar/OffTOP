import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
	getCollaboratingWorkspaces,
	getFolders,
	getPrivateWorkspaces,
	getSharedWorkspaces
} from '@/lib/supabase/queries'
import { twMerge } from 'tailwind-merge'
import WorkspaceDropdown from './workspace-dropdown'
import NativeNavigation from './native-navigation'
import { ScrollArea } from '../ui/scroll-area'
import FoldersDropdpwnList from './folders-dropdown-list'
import UserCard from './user-card'

interface SidebarProps {
	params: { workspaceId: string }
	className?: string
}

const Sidebar: React.FC<SidebarProps> = async ({ params, className }) => {
	const supabase = createServerComponentClient({ cookies })
	const {
		data: { user }
	} = await supabase.auth.getUser()

	if (!user) return

	const { data: workspaceFolderData, error: foldersError } = await getFolders(
		params.workspaceId
	)

	if (foldersError) redirect('/dashboard')
	const [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces] =
		await Promise.all([
			getPrivateWorkspaces(user.id),
			getCollaboratingWorkspaces(user.id),
			getSharedWorkspaces(user.id)
		])

	return (
		<aside
			className={twMerge(
				'hidden sm:flex sm:flex-col w-[280px] shrink-0 p-4 md:gap-4 !justify-between',
				className
			)}
		>
			<div>
				<WorkspaceDropdown
					privateWorkspaces={privateWorkspaces}
					sharedWorkspaces={sharedWorkspaces}
					collaboratingWorkspaces={collaboratingWorkspaces}
					defaultValue={[
						...privateWorkspaces,
						...collaboratingWorkspaces,
						...sharedWorkspaces
					].find(workspace => workspace.id === params.workspaceId)}
				/>
				<NativeNavigation myWorkspaceId={params.workspaceId} />
				<ScrollArea
					className='overflow-scroll relative
                 h-[450px]'
				>
					<div
						className='pointer-events-none 
          w-full 
          absolute 
          bottom-0 
          h-20 
          bg-gradient-to-t 
          from-background 
          to-transparent 
          z-40'
					/>
					<FoldersDropdpwnList
						workspaceFolders={workspaceFolderData || []}
						workspaceId={params.workspaceId}
					/>
				</ScrollArea>
			</div>
			<UserCard />
		</aside>
	)
}

export default Sidebar

import React, { Suspense } from 'react';
import styled from '@emotion/styled';
import slugify from 'slugify';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from '@mantine/core';

import { useAppContext } from '../../context';
import { backend } from '../../backend';
import { Page } from '../page';

const Message = React.lazy(
	() => import(/* webpackPreload: true */ '../message')
);

const Messages = styled.div`
	max-height: 100%;
	flex-grow: 1;
	overflow-y: scroll;
	display: flex;
	flex-direction: column;
`;

const EmptyMessage = styled.div`
	flex-grow: 1;
	padding-bottom: 5vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	font-family: 'Work Sans', sans-serif;
	line-height: 1.7;
	gap: 1rem;
`;

export default function ChatPage(props: any) {
	const { id } = useParams();
	const context = useAppContext();

	const messagesToDisplay = context.currentChat.messagesToDisplay;
	const latestMessage =
		messagesToDisplay.length > 0
			? messagesToDisplay[messagesToDisplay.length - 1]
			: undefined;
	const latestMessageLength = latestMessage ? latestMessage.content.length : 0;

	useEffect(() => {
		if (props.share || !context.currentChat.chatLoadedAt) {
			return;
		}

		const shouldScroll = Date.now() - context.currentChat.chatLoadedAt > 5000;
		if (!shouldScroll) {
			return;
		}

		const container = document.querySelector('#messages') as HTMLElement;
		const totalScrollHeight = container.scrollHeight - container.offsetHeight;
		if (latestMessageLength > 0) {
			container.scrollTop = totalScrollHeight;
		}
	}, [
		context.currentChat?.chatLoadedAt,
		props.share,
		context.currentChat.messagesToDisplay,
		latestMessageLength,
	]);

	const shouldShowChat =
		id && context.currentChat.chat && !!messagesToDisplay.length;

	return (
		<Page
			id={id || 'landing'}
			headerProps={{
				share: context.isShare,
				canShare: messagesToDisplay.length > 1,
				title:
					id && messagesToDisplay.length
						? context.currentChat.chat?.title
						: null,
				onShare: async () => {
					if (context.currentChat.chat) {
						const id = await backend.current?.shareChat(
							context.currentChat.chat
						);
						if (id) {
							const slug = context.currentChat.chat.title
								? '/' +
								  slugify(context.currentChat.chat.title.toLocaleLowerCase())
								: '';
							const url = window.location.origin + '/s/' + id + slug;
							navigator.share?.({
								title: context.currentChat.chat.title || undefined,
								url,
							});
						}
					}
				},
			}}
		>
			<Suspense
				fallback={
					<Messages id="messages">
						<EmptyMessage>
							<Loader variant="dots" />
						</EmptyMessage>
					</Messages>
				}
			>
				<Messages id="messages">
					{shouldShowChat && (
						<div style={{ paddingBottom: '4.5rem' }}>
							{messagesToDisplay.map((message) => (
								<Message
									key={message.id}
									message={message}
									share={props.share}
									last={context.currentChat.chat!.messages.leafs.some(
										(n) => n.id === message.id
									)}
								/>
							))}
						</div>
					)}
					{!shouldShowChat && (
						<EmptyMessage>
							<Loader variant="dots" />
						</EmptyMessage>
					)}
				</Messages>
			</Suspense>
		</Page>
	);
}

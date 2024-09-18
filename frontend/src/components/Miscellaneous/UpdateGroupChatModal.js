import { ViewIcon } from '@chakra-ui/icons'
import {
    Box, Button, FormControl, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent,
    ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../../Context/ChatProvider'
import UserBadgeItem from '../UserAvatar/UserBadgeItem'
import axios from 'axios'
import UserListItem from '../UserAvatar/UserListItem'

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {

    const { isOpen, onOpen, onClose } = useDisclosure()

    const [groupChatName, setGroupChatName] = useState()
    const [search, setSearch] = useState("")
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(false)
    const [renameLoading, setRenameLoading] = useState(false)

    const { selectedChat, setSelectedChat, user } = ChatState()

    const toast = useToast()

    const handleRename = async () => {
        if (!groupChatName) return

        try {
            setRenameLoading(true)

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.put('/api/chat/rename', {
                chatId: selectedChat._id,
                chatName: groupChatName
            }, config)

            setSelectedChat(data)
            setFetchAgain(!fetchAgain)
            setRenameLoading(false)
        } catch (error) {
            toast({
                title: 'Error Occured!',
                description: error.response.data.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            setRenameLoading(false)
        }

        setGroupChatName('')
    }

    const handleSearch = async (query) => {
        setSearch(query)

        if (!query) {
            return
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.get(`api/user?search=${search}`, config)

            setSearchResult(data)
        } catch (error) {
            toast({
                title: 'Error Occured!',
                description: 'Failed to load the search results',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: "bottom-left"
            })
        }
    }

    const handleAddUser = async (addUser) => {
        if (selectedChat.users.find((u) => u._id === addUser._id)) {
            toast({
                title: 'User already in the group!',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            return
        }

        if (selectedChat.groupAdmin._id !== user._id) { // matches the logged in user id
            toast({
                title: 'Only admins can add someone!',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            return
        }

        try {
            setLoading(true)

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.put('api/chat/groupadd', {
                chatId: selectedChat._id,
                userId: addUser._id
            }, config)

            setSelectedChat(data)
            setFetchAgain(!fetchAgain)
            setLoading(false)
        } catch (error) {
            toast({
                title: 'Error Occured!',
                description: error.response.data.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            setLoading(false)
        }
    }

    const handleRemoveUser = async (removeUser) => {
        if (!selectedChat.groupAdmin._id !== user._id && removeUser._id !== user._id) {
            toast({
                title: 'Only admins can remove someone!',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            return
        }

        try {
            setLoading(true)

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.put('api/chat/groupremove', {
                chatId: selectedChat._id,
                userId: removeUser._id
            }, config)

            removeUser._id === user.id ? selectedChat() : selectedChat(data)
            setFetchAgain(!fetchAgain)
            fetchMessages()
            setLoading(false)
        } catch (error) {
            toast({
                title: 'Error Occured!',
                description: error.response.data.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            setLoading(false)
        }

        setGroupChatName("")
    }

    return (
        <>
            <IconButton display={{ base: 'flex' }} icon={<ViewIcon />} onClick={onOpen} />
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontSize={'35px'} fontFamily={'Work sans'} display={'flex'} justifyContent={'center'}>{selectedChat.chatName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display={'flex'} flexDir={'column'} alignItems={'center'}>
                        <Box w="100%" display="flex" flexWrap="Wrap" pb={3}>
                            {selectedChat.users.map((u) => (
                                <UserBadgeItem key={user._id} user={u} handleFunction={() => handleRemoveUser(u)} />
                            ))}
                        </Box>

                        <FormControl display={'flex'}>
                            <Input placeholder='Chat Name' mb={3} onChange={(e) => setGroupChatName(e.target.value)} />
                            <Button variant={'solid'} colorScheme='teal' ml={1} isLoading={renameLoading} onClick={handleRename}>Update</Button>
                        </FormControl>
                        <FormControl>
                            <Input placeholder='Add users to group' mb={1} onChange={(e) => handleSearch(e.target.value)} />
                            {loading ? <Spinner size={'lg'} /> : (
                                searchResult?.map(user => (<UserListItem key={user._id} user={user} handleFunction={() => handleAddUser(user)} />))
                            )}
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='red' mr={3} onClick={() => handleRemoveUser(user)}>Leave Group</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default UpdateGroupChatModal
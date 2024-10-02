import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { getSender, getSenderFull } from '../config/ChatLogics'
import ProfileModal from './Miscellaneous/ProfileModal'
import UpdateGroupChatModal from './Miscellaneous/UpdateGroupChatModal'
import axios from 'axios'
import './styles.css'
import ScrollableChat from './ScrollableChat'
import io from 'socket.io-client'
import Lottie from 'react-lottie'
import animationData from '../animations/TypingAnimation.json'
import messageSound from '../assests/sounds/messages.wav'

const ENDPOINT = 'http://localhost:5500'
var socket, selectedChatCompare

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [newMessage, setNewMessage] = useState()
    const [socketConnected, setSocketConnected] = useState(false)
    const [typing, setTyping] = useState(false)
    const [isTyping, setIsTyping] = useState(false)

    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState()

    const toast = useToast()

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        renderSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    const fetchMessages = async () => {
        if (!selectedChat) return

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

            setLoading(true)

            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config)

            setMessages(data)
            setLoading(false)

            socket.emit('join chat', selectedChat._id)
        } catch (error) {
            toast({
                title: 'Error occured!',
                description: 'Failed to load the messages',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            setLoading(false)
        }
    }

    useEffect(() => {
        socket = io(ENDPOINT)
        socket.emit('setup', user)
        socket.on('connected', () => setSocketConnected(true))
        socket.on('typing', () => setIsTyping(true))
        socket.on('stop typing', () => setIsTyping(false))
    }, [])

    useEffect(() => {
        fetchMessages()
        selectedChatCompare = selectedChat
    }, [selectedChat])

    useEffect(() => {
        socket.on('message received', (newMessageReceived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                if (!notification.includes(newMessageReceived)) {
                    setNotification([newMessageReceived, ...notification])
                    setFetchAgain(!fetchAgain)
                    const sound = new Audio(messageSound);
                    sound.play();
                }
            } else {
                setMessages([...messages, newMessageReceived])
            }
        })
    })


    const sendMessage = async (event) => {
        if (event.key === 'Enter' && newMessage) {
            socket.emit('stop typing', selectedChat._id)
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    }
                }

                setNewMessage('')

                const { data } = await axios.post('/api/message', {
                    content: newMessage,
                    chatId: selectedChat._id
                }, config)

                socket.emit('new message', data)
                setMessages([...messages, data])
            } catch (error) {
                toast({
                    title: 'Error occured!',
                    description: 'Failed to sent the message',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                })
            }
        }
    }

    const typingHandler = (e) => {
        setNewMessage(e.target.value)

        if (!socketConnected) return

        if (!typing) {
            setTyping(true)
            socket.emit('typing', selectedChat._id)
        }

        let lastTypingTime = new Date().getTime()
        var timerLength = 3000

        setTimeout(() => {
            var timeNow = new Date().getTime()
            var timeDiff = timeNow - lastTypingTime

            if (timeDiff >= timerLength && typing) {
                socket.emit('stop typing', selectedChat._id)
                setTyping(false)
            }
        }, timerLength);
    }

    return (
        <>
            {
                selectedChat ? (
                    <>
                        <Box
                            pb={3}
                            px={2}
                            w="100%"
                            display={"flex"}
                            justifyContent={{ base: "space-between" }}
                            alignItems={"center"}
                        >
                            <IconButton display={{ base: "flex", md: "none" }} icon={<ArrowBackIcon />} onClick={() => setSelectedChat("")} />

                            {
                                (!selectedChat.isGroupChat ? (
                                    <>
                                        <Text
                                            fontFamily={"Work Sans"}
                                            fontSize={{ base: "28px", md: "30px" }}
                                        >
                                            {getSender(user, selectedChat.users)}
                                        </Text>
                                        <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                                    </>
                                ) : (
                                    <>
                                        {selectedChat.chatName.toUpperCase()}
                                        <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />
                                    </>
                                ))
                            }
                        </Box>
                        <Box
                            display={'flex'}
                            flexDir={'column'}
                            justifyContent={'flex-end'}
                            p={3}
                            bg={'#E8E8E8'}
                            w='100%'
                            h='100%'
                            borderRadius={'lg'}
                            overflow={'hidden'}
                        >
                            {loading ?
                                (<Spinner size={'xl'} w={20} h={20} alignSelf={'center'} margin={'auto'} />)
                                : (
                                    <div className='messages'>
                                        <ScrollableChat messages={messages} />
                                    </div>
                                )
                            }

                            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                                {isTyping ? (
                                    <div style={{ display: 'flex', marginTop: '-8px', marginBottom: '2px', marginLeft: '34px' }}>
                                        <div>
                                            <Lottie
                                                options={defaultOptions}
                                                width={70}
                                            />
                                        </div>
                                    </div>
                                ) : (<div></div>)}
                                <Input variant='filled' bg='#E0E0E0' placeholder='Enter a message...' onChange={typingHandler} value={newMessage} />
                            </FormControl>
                        </Box>
                    </>
                ) : (
                    <Box display={"flex"} alignItems={"center"} justifyContent={"center"} h={"100%"}>
                        <Text fontSize={"3xl"} pb={3} fontFamily={"Work Sans"}>
                            Click on a user to start chatting
                        </Text>
                    </Box>
                )
            }
        </>
    )
}

export default SingleChat
import React, { useEffect } from 'react'
import { Container, Box, Text, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import Login from '../components/authentication/Login'
import SignUp from '../components/authentication/SignUp'
import { useHistory } from 'react-router-dom'

const HomePage = () => {
    const history = useHistory()

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))

        if (userInfo) history.push('/chats')
    }, [history])

    return (
        <Container maxW='xl' centerContent>
            <Box
                d='felx'
                justifyContent='center'
                p={3}
                bg={'white'}
                w='100%'
                m='40px 0 15px 0'
                borderRadius='lg'
                borderWidth='1px'
            >
                <Text fontSize='4xl' fontFamily='Work Sans' textAlign={'center'} color='black'>Chatty</Text>
            </Box>
            <Box bg={'white'} w='100%' p={4} borderRadius={'lg'} color={'black'} borderWidth={'1px'}>
                <Tabs variant='soft-rounded'>
                    <TabList mb="1em">
                        <Tab width={"50%"}>Login</Tab>
                        <Tab width={"50%"}>Sign Up</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Login />
                        </TabPanel>
                        <TabPanel>
                            <SignUp />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Container>
    )
}

export default HomePage
import {
  Box,
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { IconButton } from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { ChatState } from "../../context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import axios from "axios";
import UserListItem from "../userAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [groupChatName, setGroupChatName] = useState();
  const [selectedUser, setSelectedUser] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const toast = useToast();

  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleRemove = async (userToRem) => {
    if (
      selectedChat.groupAdmin._id !== user._id &&
      userToRem._id !== user._id
    ) {
      toast({
        title: "Only admins can remove user.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } else {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.put(
          "/api/chat/groupremove",
          {
            chatId: selectedChat._id,
            userId: userToRem._id,
          },
          config
        );

        userToRem === user._id ? setSelectedChat() : setSelectedChat(data);
        setFetchAgain(!fetchAgain);
        setLoading(false);
      } catch (error) {
        toast({
          title: "An error occured!",
          description: "Failed to remove the user.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
        setLoading(false)
      }
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/rename",
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (error) {
      toast({
        title: "Fail to update group.",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }

    setGroupChatName("");
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;
    //console.log(`${query} and ${search}`)
    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${query}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "An error occured!",
        description: "Failed to load the search results.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
      toast({
        title: "User already in the group.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } else if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can add user.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } else {
      try {
        setLoading(true);

        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.put(
          "/api/chat/groupadd",
          {
            chatId: selectedChat._id,
            userId: userToAdd._id,
          },
          config
        );

        setSelectedChat(data);
        setFetchAgain(!fetchAgain);
        setLoading(false);
      } catch (error) {
        toast({
          title: "An error occured!",
          description: "Failed to add user.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
      }
    }
  };

  return (
    <>
      <IconButton onClick={onOpen} d={{ base: "flex" }} icon={<ViewIcon />} />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w="100%" d="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleRemove(user)}
                />
              ))}
            </Box>
            <FormControl d="flex">
              <Input
                placeholder="Chat name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>

            <FormControl>
              <Input
                placeholder="Add user to group"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Spinner size="lg" />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" onClick={() => handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;

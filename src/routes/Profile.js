import { authService, dbService } from "fbase";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Nweet from "components/Nweet";

const Profile = ({ userObj, refreshUser }) => {
    const [nweets, setNweets] = useState([]);
    const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);

    const history = useHistory();

    const onChange = (event) => {
        const { target: { value } } = event;
        setNewDisplayName(value);
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        if (userObj.displayName !== newDisplayName) {
            await userObj.updateProfile({ displayName: newDisplayName });
            refreshUser();
        }
    };
    
    const onLogOutClick = () => {
        authService.signOut();
        history.push("/");
    };

    const getNweets = async () => {
        const nweets = await dbService.collection("nweets").where("creatorID", "==", userObj.uid).orderBy("createdAt", "asc").get();
        const newArray = nweets.docs.map((document) => ({ id: document.id, ...document.data() }));
        setNweets(newArray);
    };

    useEffect(() => {
        getNweets();
    }, []);
    
    return (
        <>
            <form onSubmit={onSubmit}>
                <input type="text" onChange={onChange} placeholder="Display Name" value={newDisplayName} />
                <input type="submit" value="Update Profile" />
            </form>
            <button onClick={onLogOutClick}>Logout</button>
            <div>
                {nweets.map((nweet) => (
                    <Nweet key={nweet.id} nweetObj={nweet} isOwner={nweet.creatorID === userObj.uid} />
                ))}
            </div>
        </>
    );
};

export default Profile;
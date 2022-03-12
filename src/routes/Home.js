import { dbService, storageService } from "fbase";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Nweet from "components/Nweet";

const Home = ({ userObj }) => {
    const [nweet, setNweet] = useState();
    const [nweets, setNweets] = useState([]);
    const [attachment, setAttachment] = useState("");

    useEffect(() => {
        dbService.collection("nweets").orderBy("createdAt", "asc").onSnapshot((snapshop) => {
            const newArray = snapshop.docs.map((document) => ({ id: document.id, ...document.data() }));
            setNweets(newArray);
        });
    }, []);

    const onSubmit = async (event) => {
        event.preventDefault();

        let attachmentUrl = "";

        if (attachment != "") {
            const attachmentRef = storageService.ref().child(`${userObj.uid}/${uuidv4()}`);
            const response = await attachmentRef.putString(attachment, 'data_url');
            attachmentUrl = await response.ref.getDownloadURL();
        }
        
        await dbService.collection("nweets").add({
            text: nweet,
            createdAt: Date.now(),
            creatorID: userObj.uid,
            attachmentUrl,
        });

        setNweet("");
        setAttachment("");
    };

    const onChange = (event) => {
        event.preventDefault();
        const { target: { value } } = event;
        setNweet(value);
    };

    const onFileChange = (event) => {
        const { target: { files } } = event;
        const theFile = files[0];
        const reader = new FileReader();
        reader.onloadend = (finishedEvent) => {
            const { currentTarget: { result } } = finishedEvent;
            setAttachment(result);
        };
        reader.readAsDataURL(theFile);
    };

    const onClearAttachment = () => setAttachment("");

    return (
        <>
            <form onSubmit={onSubmit}>
                <input value={nweet} onChange={onChange} type="text" placeholder="What's on you mind?" maxLength={120} />
                <input type="file" onChange={onFileChange} accept="image/*" />
                <input type="submit" value="Nweet" />
                {attachment && (
                    <div>
                        <img src={attachment} width="50px" height="50px" object-fit="cover"/>
                        <button onClick={onClearAttachment}>Clear</button>
                    </div>
                )}
            </form>
            <div>
                {nweets.map((nweet) => (
                    <Nweet key={nweet.id} nweetObj={nweet} isOwner={nweet.creatorID === userObj.uid} />
                ))}
            </div>
        </>
    );
};

export default Home;
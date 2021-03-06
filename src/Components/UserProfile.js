
/******************************Imports**************************** */
import {apiBaseUrl} from "../Config/Config";
import { useSelector, useDispatch } from "react-redux";
import {setUserDetails, setProfilePicture} from "../Redux/Slices/UserDetailsSlice";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";


/******************************Variables**************************** */
const getUserDetailsApiUrl = `${apiBaseUrl}/users/profile`; //The api url to get the user profile details
const editUserDetailsApiUrl = `${apiBaseUrl}/users/editprofile`; //The api url for editing the user profile details

/******************************Component**************************** */
function UserProfile()
{
    const userDetails = useSelector((state) => state.userDetails); //Getting the user details state from redux store
    const dispatch = useDispatch();
    const history = useHistory();

    const [days, setDays] = useState(getDaysInMonth(userDetails.bdate.month, userDetails.bdate.year)); //The date state to ensure the proper number of day are displayed in the spinner
    const [showLoadingSpinner, setShowLoadingSpinner] = useState(false); //Indicates whether the loading spinner should be displayed
    const [profilePicUrl, setProfilePicUrl] = useState(userDetails.profilePic); //The profile pic url

    //Loading the user details
    useEffect(() => {
        if(!userDetails.initialized)
            loadUserData(dispatch)
    },[]);

    //Updating the user profile picture
    useEffect(() => setProfilePicUrl(userDetails.profilePic), [userDetails.profilePic]);

    //Creating function to display months of the year
    const getMonths = () => {
        const monthsNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        return monthsNames.map((monthName, index) => (<option value={`${index}`} key={index}>{monthName}</option>));
    };

    //Creating a function to display the possible birth years
    const getYears = () => {
        const years = [];
        const currYear = (new Date()).getFullYear();
        for(let i = 1950; i <= currYear; ++i)
        {
            years.push(<option value={`${i}`} key={i}>{i}</option>);
        }
        return years;
    };

    //Function to changes in the number of days due to change in the selected month or year
    const dateChanged = () => {
        setDays(getDaysInMonth(parseInt(document.getElementById("bmonth").value), parseInt(document.getElementById("byear").value)));
    };
    
    console.log(`userProfile`)
    
    return (
        <div className="user-profile">
            <div className="profile-box">
                <div className="box-title-bar" style={{alignSelf: "stretch"}}>
                    <button onClick={() => history.push("/")}>Home</button>
                    <h1 style={{color: "grey"}}>Edit Profile</h1>
                    <div />
                </div>
                
                <img className="user-pic" src={profilePicUrl} alt="pic"/>
                <input type="file" id="profile_pic" accept="image/jpeg" onChange={(e) => setUserProfilePic(setProfilePicUrl, e)}/>
                
                <form onSubmit={(event) => {
                    event.preventDefault();
                    if(userDetails.initialized)
                        updateUserData(userDetails, dispatch, setShowLoadingSpinner);
                }}>
                    <label for="username">Username</label>
                    <input type="text" id="username" defaultValue={userDetails.username}/>
                    <label>Birthday</label>
                    <div>
                        <select id="bday" key={userDetails.bdate.day} defaultValue={userDetails.bdate.day}>
                            {days}
                        </select>
                        <select id="bmonth" key={userDetails.bdate.month} defaultValue={userDetails.bdate.month} onChange={dateChanged}>
                            {getMonths()}
                        </select>
                        <select id="byear" key={userDetails.bdate.year} defaultValue={userDetails.bdate.year} onChange={dateChanged}>
                            {getYears()}
                        </select>
                    </div>
                    <button type="submit">Save Details</button>
                </form>
                {showLoadingSpinner && <div className="loading-spinner" />}
                
            </div>
        </div>
    )
}

/******************************Functions**************************** */
function getDaysInMonth(month, year)
{
    /*Returns the list of days in the given month of the given year */

    const daysOptions = [];
    const daysInMonth = (new Date(year, month+1, 0)).getDate();
    for(let i = 1; i <= daysInMonth; ++i)
    {
        daysOptions.push(<option value={`${i}`} key={i}>{`${i}`}</option>);
    }
    return daysOptions;
}

function loadUserData(dispatch)
{
    /*Loads the user profile details*/ 

    //Getting the user profile details
    fetch(getUserDetailsApiUrl, {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
        credentials: "include"
    })
    .then((resp) => {
        if(resp.status !== 200)
            throw Error(resp.status);
        return resp.json();
    })
    .then((data) => {
        if(!data.success)
            throw Error(data.code);
        
        //Setting the user details
        dispatch(setUserDetails({username: data.user.username, bdate: {day: data.user.bday, month: data.user.bmonth, year: data.user.byear}, followers: data.user.followers, following: data.user.following, profilePicUrl : data.user.picUrl}));
    })
    .catch((err) => {
        console.log(err);
        alert("Failed to load user details");
    })

}

function setUserProfilePic(setProfilePicUrl, event)
{
    /*Sets the user profile picture */

    //Getting the profile pic url
    if(event.target.files && event.target.files[0]) //Checking if a file has been uploaded
        setProfilePicUrl(URL.createObjectURL(event.target.files[0]));
    
}

function updateUserData(oldDetails, dispatch, setShowLoadingSpinner)
{
    /*Validates user data and sends request to save it*/

    //Displaying the loading spinner
    setShowLoadingSpinner(true);

    //Getting the entered data
    const userDetails = {
        username: document.getElementById("username").value.trim(),
        bday: parseInt(document.getElementById("bday").value),
        bmonth: parseInt(document.getElementById("bmonth").value),
        byear: parseInt(document.getElementById("byear").value)
    };
    //Adding the profile pic url
    const picInput = document.getElementById("profile_pic");
    console.log(picInput.files)
    if(picInput.files && picInput.files[0])
        userDetails.profilePic = picInput.files[0];
    console.log(userDetails)
    
    //Validating the user details
    if(validateUserDetails(userDetails))
    {
        //Creating the form data
        const formData = new FormData();
        
        //Removing the unchanged details
        if(oldDetails.username !== userDetails.username)
            formData.append("username", userDetails.username);
        if(oldDetails.bdate.day !== userDetails.bday)
            formData.append("bday", userDetails.bday);
        if(oldDetails.bdate.month !== userDetails.bmonth)
            formData.append("bmonth", userDetails.bmonth);
        if(oldDetails.bdate.year !== userDetails.byear)
            formData.append("byear", userDetails.byear);
        if(userDetails.profilePic)
            formData.append("profilePic", userDetails.profilePic);
        
        
        //Sending request to update user details
        fetch(editUserDetailsApiUrl, {
            method: "PUT",
            credentials: "include",
            body: formData
        })
        .then((resp) => {
            if(resp.status !== 200)
                throw Error(resp.status);
            return resp.json();
        })
        .then((data) => {
            if(!data.success)
                throw Error(data);

            //Updating the user details state
            const updatedDetails = {
                username: userDetails.username ? userDetails.username : oldDetails.username,
                bdate : {
                    day: userDetails.bday ? userDetails.bday : oldDetails.bdate.day, 
                    month: userDetails.bmonth ? userDetails.bmonth : oldDetails.bdate.month,
                    year: userDetails.byear ? userDetails.byear : oldDetails.bdate.year,
                },
                followers: oldDetails.followers,
                following: oldDetails.following,
            };
            dispatch(setUserDetails(updatedDetails));
            setShowLoadingSpinner(false);
        })
        .catch((err) => {
            console.log(err);
            alert(err);
            setShowLoadingSpinner(false);
        })
    }
    else
        alert("Username cannot be empty");
    
}

function validateUserDetails(userDetails)
{
    /*Checks if the entered user details are valid */

    return (userDetails.username.length > 0);
}

/******************************Exports**************************** */
export default UserProfile;
export {loadUserData};
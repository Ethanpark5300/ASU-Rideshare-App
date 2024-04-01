import React, { useCallback, useEffect, useState } from 'react';
import '../styles/Rating.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const Rating: React.FC = (props) => {
    const navigate = useNavigate();
    const account = useAppSelector((state) => state.account);
    const [userType, setUserType] = useState<number>();
    const [riderRatingInformation, setRiderRatingInformation] = useState<any>([]);
    const [driverRatingInformation, setDriverRatingInformation] = useState<any>([]);
    const [driverFavoriteStatus, setDriverFavoriteStatus] = useState<string>();
    const [showFavoriteButtons, setShowFavoriteButtons] = useState<boolean>(true);

    const getAccountInformation = useCallback(async () => {
        try {
            const response = await fetch(`/view-account-info?accountEmail=${account?.account?.email}`);
            const data = await response.json();
            if (data.account) setUserType(data.account.Type_User);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    useEffect(() => {
        const delay: number = 500;
        const timerId = setTimeout(() => {
            async function getRatingsInformation() {
                try {
                    const response = await fetch(`/get-ratings-information?userid=${account?.account?.email}`);
                    const data = await response.json();
                    setRiderRatingInformation(data.driverRatingInformation);
                    setDriverRatingInformation(data.riderRatingInformation);
                } catch (error) {
                    console.error("Error retrieving ratings information:", error);
                }
            };
            getRatingsInformation();
        }, delay);
        return () => clearTimeout(timerId);
    }, [account?.account?.email]);

    const checkFavoriteStatus = useCallback(async () => {
        if (userType !== 1) return; /** Don't run if user is not a rider */

        try {
            const response = await fetch(`/check-driver-favorite-status?riderid=${account?.account?.email}`);
            const data = await response.json();
            setDriverFavoriteStatus(data.currentDriverFavoriteStatus);
            setShowFavoriteButtons(driverFavoriteStatus !== "Pending" && driverFavoriteStatus !== "Favorited");
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email, userType, driverFavoriteStatus]);

    const [formChanges, setFormChanges] = useState({
        rating: 0,
        comment: '',
        favorite: false,
    });

    const handleRatingChange = (newRating: number) => {
        setFormChanges({ ...formChanges, rating: newRating });
    };

    const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormChanges({ ...formChanges, comment: event.target.value });
    };

    const handleFavoriteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value === 'yes';
        setFormChanges({ ...formChanges, favorite: newValue });
    };

    const handleRiderRatingSubmit = () => {
        try {
            fetch(`/send-rider-ratings`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    riderid: account?.account?.email,
                    driverid: riderRatingInformation.Driver_ID,
                    star_rating: formChanges.rating,
                    comments: formChanges.comment,
                    favorited_driver: formChanges.favorite
                }),
            })
        } catch (error: any) {
            console.log("Error sending rider rating:", error);
        }
    };

    const handleDriverRatingSubmit = () => {
        try {
            fetch(`/send-driver-ratings`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    driverid: account?.account?.email,
                    riderid: driverRatingInformation.Rider_ID,
                    star_rating: formChanges.rating,
                    comments: formChanges.comment,
                }),
            })
        } catch (error: any) {
            console.log("Error sending rider rating:", error);
        }
    };

    const handleBlock = async () => {
        try {
            fetch(`/send-blocked`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    blocker: account?.account?.email,
                }),
            })
            alert('User blocked!');
        } catch (error: any) {
            console.log("Error blocking user:", error);
        }
    };

    useEffect(() => {
        getAccountInformation();
        checkFavoriteStatus();
    }, [getAccountInformation, checkFavoriteStatus]);

    return (
        <PageTitle title="Rating">
            <main id="rating">

                {/** Rider ratings */}
                {(userType === 1) && (
                    <>
                        <h1>Rate {riderRatingInformation.First_Name} {riderRatingInformation.Last_Name}</h1>

                        {/* Five star ratings */}
                        <div className="stars-container">
                            <label>Rating: { } </label>
                            <div className="stars-wrapper">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        onClick={() => handleRatingChange(star)}
                                        className={`star ${star <= (formChanges.rating || 0) ? 'active' : ''}`}
                                    >
                                        &#9733;
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Comment input */}
                        <div className="comment-container">
                            <label htmlFor='comments'>Comment:</label>
                            <textarea
                                value={formChanges.comment}
                                onChange={handleCommentChange}
                                className="comment-input"
                                placeholder="Enter your comments here..."
                                name='comments'
                                id='comments'
                            />
                        </div>

                        {/* Favorite driver radio buttons */}
                        {showFavoriteButtons && (
                            <div className="favorite-container">
                                <label>Favorite driver?</label>
                                <div className='favorite-radio-buttons-container'>
                                    <label htmlFor='yes'>
                                        <input
                                            type="radio"
                                            name="favorite"
                                            value="yes"
                                            onChange={handleFavoriteChange}
                                            id='yes'
                                        />{' '}
                                        Yes
                                    </label>
                                    <label htmlFor='no'>
                                        <input
                                            type="radio"
                                            name="favorite"
                                            value="no"
                                            onChange={handleFavoriteChange}
                                            id='no'
                                        />{' '}
                                        No
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Submit, Report, Block buttons */}
                        <div className="buttons-container">
                            <button onClick={handleRiderRatingSubmit} className="submit-button">Submit</button>
                            <button onClick={() => navigate("/Report")} className='report-button'>Report</button>
                            <button onClick={handleBlock} className="block-button">Block</button>
                        </div>
                    </>
                )}

                {/** Driver ratings */}
                {(userType === 2) && (
                    <>
                        <h1>Rate {driverRatingInformation.First_Name} {driverRatingInformation.Last_Name}</h1>

                        {/* Five star ratings */}
                        <div className="stars-container">
                            <label>Rating: { } </label>
                            <div className="stars-wrapper">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        onClick={() => handleRatingChange(star)}
                                        className={`star ${star <= (formChanges.rating || 0) ? 'active' : ''}`}
                                    >
                                        &#9733;
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Comment input */}
                        <div className="comment-container">
                            <label htmlFor='comments'>Comment:</label>
                            <textarea
                                value={formChanges.comment}
                                onChange={handleCommentChange}
                                className="comment-input"
                                placeholder="Enter your comments here..."
                                name='comments'
                                id='comments'
                            />
                        </div>

                        {/* Submit, Report, Block buttons */}
                        <div className="buttons-container">
                            <button onClick={handleDriverRatingSubmit} className="submit-button">Submit</button>
                            <button onClick={() => navigate("/Report")} className='report-button'>Report</button>
                            <button onClick={handleBlock} className="block-button">Block</button>
                        </div>
                    </>
                )}
            </main>
        </PageTitle>
    );
};

export default Rating;
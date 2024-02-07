import React, { useState, useEffect } from 'react';
import '../styles/Rating.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { Link } from 'react-router-dom';

interface RatingProps {
    email: string;
}

interface RatingFormState {
    rating: number;
    comment: string;
    favorite: boolean;
}

const Rating: React.FC<RatingProps> = (props) => {
    const [formData, setFormData] = useState<RatingFormState>({
        rating: 0,
        comment: '',
        favorite: false,
    });

    const [formChanges, setFormChanges] = useState<RatingFormState>({
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
        // console.log("New value:", newValue);
        setFormChanges({ ...formChanges, favorite: newValue });
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setFormData({ ...formChanges });
        console.log('Rating:', formChanges.rating);
        console.log('Comment:', formChanges.comment);
        console.log('Favorite:', formChanges.favorite);
    };

    /** @TODO Add custom popup */
    const handleBlock = () => {
        alert('User blocked!');
    };

    // useEffect(() => {
    //     console.log("Form data:", formData);
    // }, [formData]);

    /** @TODO Replace value with ratee name */
    const rateeUser = "[Var]";

    return (
        <PageTitle title="Rating">
            <main id="rating">
                <h1>Rate {rateeUser}</h1>

                {/* Five star ratings */}
                <div className="stars-container">
                    <label>Rating:</label>
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
                    <label>Comment:</label>
                    <textarea
                        value={formChanges.comment}
                        onChange={handleCommentChange}
                        className="comment-input"
                        placeholder="Enter your comments here..."
                    />
                </div>
                {/* Favorite driver radio buttons */}
                <div className="favorite-container">
                    <label>Favorite driver?</label>
                    <div className='favorite-radio-buttons-container'>
                        <label>
                            <input
                                type="radio"
                                name="favorite"
                                value="yes"
                                onChange={handleFavoriteChange}
                            />{' '}
                            Yes
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="favorite"
                                value="no"
                                onChange={handleFavoriteChange}
                            />{' '}
                            No
                        </label>
                    </div>
                </div>
                {/* Submit, Report, Block buttons */}
                <div className="buttons-container">
                    <button onClick={handleSubmit} className="submit-button">
                        Submit
                    </button>
                    <Link to="/Report">
                        <button className='report-button'>Report</button>
                    </Link>
                    <button onClick={handleBlock} className="block-button">
                        Block
                    </button>
                </div>
            </main>
        </PageTitle>
    );
};

export default Rating;
import React, { useState } from 'react';
import '../styles/Rating.css';
import Navbar from '../components/Navigation_Bar/Navbar';
import PageTitle from '../components/Page_Title/PageTitle';

interface RatingProps {
    name: string;
}

interface RatingFormState {
    rating: number | null;
    comment: string;
    favorite: boolean | null;
}

const Rating: React.FC<RatingProps> = (props) => {
    const [formData, setFormData] = useState<RatingFormState>({
        rating: null,
        comment: '',
        favorite: null,
    });

    const [showResults, setShowResults] = useState(false);

    const handleRatingChange = (newRating: number | null) => {
        setFormData({ ...formData, rating: newRating });
    };

    const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({ ...formData, comment: event.target.value });
    };

    const handleFavoriteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, favorite: event.target.value === 'yes' });
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setShowResults(true);
        console.log('Rating:', formData.rating);
        console.log('Comment:', formData.comment);
        console.log('Favorite:', formData.favorite);
    };

    const handleClear = () => {
        setFormData({ rating: null, comment: '', favorite: null });
        setShowResults(false);
    };

    const handleReport = () => {
        alert('User reported!');
        // Add a delay to wait for the user to acknowledge the alert
        setTimeout(() => {
            setShowResults(false);
        }, 100);
    };

    const handleBlock = () => {
        alert('User blocked!');
        // Add a delay to wait for the user to acknowledge the alert
        setTimeout(() => {
            setShowResults(false);
        }, 100);
    };

    return (
        <PageTitle title="Rating">
            <Navbar />
            <div className="gray-box">
                <div className="rating-container">
                    <h1 className="rating-heading">Rate [props.name]</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="stars-container">
                            <label className="label">Rating:</label>
                            <div>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        onClick={() => handleRatingChange(star)}
                                        className={`star ${star <= (formData.rating || 0) ? 'active' : ''}`}
                                    >
                                        &#9733;
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="comment-container">
                            <label className="label">Comment:</label>
                            <textarea
                                value={formData.comment}
                                onChange={handleCommentChange}
                                rows={4}
                                className="comment-input"
                                placeholder="Enter your comments here..."
                            />
                        </div>
                        <div className="favorite-container">
                            <label className="label">Favorite driver?</label>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="favorite"
                                        value="yes"
                                        checked={formData.favorite === true}
                                        onChange={handleFavoriteChange}
                                    />{' '}
                                    Yes
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="favorite"
                                        value="no"
                                        checked={formData.favorite === false}
                                        onChange={handleFavoriteChange}
                                    />{' '}
                                    No
                                </label>
                            </div>
                        </div>
                        <div className="buttons-container">
                            <button type="submit" className="submit-button">
                                Submit
                            </button>
                            <button onClick={handleReport} className="report-button">
                                Report
                            </button>
                            <button onClick={handleBlock} className="block-button">
                                Block
                            </button>
                        </div>
                    </form>

                    {/* Display results below the form if showResults is true */}
                    <div className={`results-container ${showResults ? 'show' : ''}`}>
                        <h2 className="results-heading">Results</h2>
                        <p className="result-item">Rating: {formData.rating}</p>
                        <p className="result-item">Comment: {formData.comment}</p>
                        <p className="result-item">Favorite driver: {formData.favorite ? 'Yes' : 'No'}</p>
                        <button onClick={handleClear} className="submit-button">
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </PageTitle>
    );
};

export default Rating;

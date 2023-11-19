import React, { useState, useEffect } from 'react';
import '../styles/Rating.css';
import Navbar from '../components/Navigation_Bar/Navbar';
import PageTitle from '../components/Page_Title/PageTitle';

interface RatingProps {
    name: string;
}

interface RatingFormState {
    rating: number;
    comment: string;
    favorite: boolean | null;
}

const Rating: React.FC<RatingProps> = (props) => {
    const [formData, setFormData] = useState<RatingFormState>({
        rating: 0,
        comment: '',
        favorite: null,
    });

    const [formChanges, setFormChanges] = useState<RatingFormState>({
        rating: 0,
        comment: '',
        favorite: null,
    });

    const [showResults, setShowResults] = useState(false);

    const handleRatingChange = (newRating: number) => {
        setFormChanges({ ...formChanges, rating: newRating });
    };

    const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormChanges({ ...formChanges, comment: event.target.value });
    };

    const handleFavoriteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormChanges({ ...formChanges, favorite: event.target.value === 'yes' });
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setFormData({ ...formChanges });
        setShowResults(true);
    };

    useEffect(() => {
        if (showResults) {
            console.log('Rating:', formData.rating);
            console.log('Comment:', formData.comment);
            console.log('Favorite:', formData.favorite);
        }
    }, [showResults, formData]);

    const handleClear = () => {
        setFormChanges({ rating: 0, comment: '', favorite: null });
        setFormData({ rating: 0, comment: '', favorite: null });
        setShowResults(false);

        // Log the default values to the console
        console.log('Rating:', 0);
        console.log('Comment:', '');
        console.log('Favorite:', null);
    };

    const handleReport = () => {
        alert('User reported!');
        setTimeout(() => {
            setShowResults(false);
        }, -100);
    };

    const handleBlock = () => {
        alert('User blocked!');
        setTimeout(() => {
            setShowResults(false);
        }, -100);
    };

    return (
        <PageTitle title="Rating">
            <Navbar />
            <div className="gray-box">
                <div className="rating-container">
                    <h1 className="rating-heading">Rate {props.name}</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="stars-container">
                            <label className="label">Rating:</label>
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
                        <div className="comment-container">
                            {/* Comment input */}
                            <label className="label">Comment:</label>
                            <textarea
                                value={formChanges.comment}
                                onChange={handleCommentChange}
                                rows={4}
                                className="comment-input"
                                placeholder="Enter your comments here..."
                            />
                        </div>
                        <div className="favorite-container">
                            {/* Favorite driver radio buttons */}
                            <label className="label">Favorite driver?</label>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="favorite"
                                        value="yes"
                                        checked={formChanges.favorite === true}
                                        onChange={handleFavoriteChange}
                                    />{' '}
                                    Yes
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="favorite"
                                        value="no"
                                        checked={formChanges.favorite === false}
                                        onChange={handleFavoriteChange}
                                    />{' '}
                                    No
                                </label>
                            </div>
                        </div>
                        <div className="buttons-container">
                            {/* Submit, Report, Block buttons */}
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

                    {/* Results container */}
                    <div className={`results-container ${showResults ? 'show' : ''}`}>
                        <h2 className="results-heading">Results</h2>
                        <p className="result-item">Rating: {formData.rating}</p>
                        <p className="result-item">Comment: {formData.comment}</p>
                        <p className="result-item">Favorite driver: {formData.favorite === null ? 'Not selected' : formData.favorite ? 'Yes' : 'No'}</p>
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

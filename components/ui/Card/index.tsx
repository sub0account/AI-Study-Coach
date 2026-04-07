import React from 'react';

const Card = ({ children }) => {
    return <div className="card">{children}</div>;
};

Card.Content = ({ children }) => {
    return <div className="card-content">{children}</div>;
};

Card.Header = ({ children }) => {
    return <div className="card-header">{children}</div>;
};

Card.Footer = ({ children }) => {
    return <div className="card-footer">{children}</div>;
};

export default Card;
import React from 'react';

const OverlayItem = ({ overlay }) => {
    
    const style = {
        position: 'absolute',
        top: `${overlay.position_y}px`,
        left: `${overlay.position_x}px`,
        padding: '5px 10px',
        background: 'rgba(0, 0, 0, 0.6)',
        color: '#FFD700',
        fontSize: '20px',
        border: '1px dashed #FFD700',
        cursor: 'grab',
        zIndex: 100
    };

    return (
        <div style={style}>
            {overlay.overlay_text}
        </div>
    );
};

export default OverlayItem;
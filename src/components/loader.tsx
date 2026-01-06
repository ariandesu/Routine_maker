
import React from 'react';

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <div>
        <div className="loader">
          <span><span /><span /><span /><span /></span>
          <div className="base">
            <span />
            <div className="face" />
          </div>
        </div>
        <div className="longfazers">
          <span /><span /><span /><span />
        </div>
      </div>
    </div>
  );
}

export default Loader;

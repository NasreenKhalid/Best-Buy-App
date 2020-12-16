import React from 'react'
import Link from 'next/link'
import Nav from './Nav'
import Cart from './Cart'
import styled from 'styled-components'
import Router from 'next/router';
import NProgress from 'nprogress'
import Search from './Search'

Router.onRouteChangeStart=() => {
NProgress.start();
}

Router.onRouteChangeComplete = () => {
NProgress.done();
}

Router.onRouteChangeError = () => {
    NProgress.done();
}

const Logo = styled.h1`
font-size:3rem;
margin-left:2rem;
z-index:2;
position:relative;
transform: skew(-7deg);
letter-spacing:0.35rem;
font-family:'arial';
font-weight:300;


a {
    padding: 0.5rem 1rem;
    background: ${props => props.theme.blue};
    color:white;
    text-transform:capitalize;
    text-decoration:none;
}
@media (max-width: 1300px) {
    margin:0;
    text-align:center;
}
`;

const StyledHeader = styled.header`
.bar{
    border-bottom: 10px solid ${props => props.theme.black};
    display: grid;
    grid-template-columns: auto 1fr;
    justify-content: space-between;
    align-items: stretch;
    @media (max-width: 1300px) {
      grid-template-columns: 1fr;
      justify-content: center;
    }   
}
.sub-bar{
    display:grid;
    grid-template-columns:1fr auto;
    border-bottom:1px solid ${props=>props.theme.lightgrey}
}

`


const Header = () => {

        return (
            <StyledHeader>
              <div className="bar">
      <Logo>
          <Link href="/"><a >Best Buy Store</a></Link>
      </Logo>
        
        <Nav />
                  </div>  
                  <div className="sub-bar">
                    <Search />
                  </div>
                 <Cart />
            </StyledHeader>
        )

}

export default Header;

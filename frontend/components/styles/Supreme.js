import styled from 'styled-components';

const Supreme = styled.h3`
  background: ${props => props.theme.blue};
  color: white;
  display: inline-block;
  padding: 2px 7px;
  transform: skew(-3deg);
  margin: 0;
  font-size: 3rem;
  border-radius:3px;
`;

export default Supreme;

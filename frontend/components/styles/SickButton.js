import styled from 'styled-components';

const SickButton = styled.button`
  background: #1aa6b7;
  color: white;
  font-weight: 500;
  border: 0;
  border-radius: 4px;
  text-transform: uppercase;
  font-size: 2rem;
  padding: 0.8rem 0.04rem;
  transform: skew(-2deg);
  display: inline-block;
  transition: all 0.5s;
  &[disabled] {
    opacity: 0.5;
  }
`;

export default SickButton;

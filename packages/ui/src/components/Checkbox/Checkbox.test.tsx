import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';

test('calls onChange when clicked', () => {
  const onChange = vi.fn();
  render(<Checkbox label="Agree" checked={false} onChange={onChange} />);
  fireEvent.click(screen.getByLabelText(/agree/i));
  expect(onChange).toHaveBeenCalledWith(true);
});

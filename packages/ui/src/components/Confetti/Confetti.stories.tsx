import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button/Button';
import { Confetti } from './Confetti';

const meta: Meta<typeof Confetti> = {
  title: 'Components/Confetti',
  component: Confetti,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Confetti>;

const ConfettiWithTrigger = () => {
  const [isActive, setIsActive] = useState(false);

  const handleTrigger = () => {
    setIsActive(true);
  };

  const handleComplete = () => {
    setIsActive(false);
  };

  return (
    <div className="ui:flex ui:items-center ui:justify-center ui:min-h-screen">
      <Button intent="primary" onClick={handleTrigger} disabled={isActive}>
        {isActive ? 'Celebrating! 🎉' : 'Trigger Confetti'}
      </Button>
      <Confetti isActive={isActive} onComplete={handleComplete} count={200} />
    </div>
  );
};

export const Default: Story = {
  render: () => <ConfettiWithTrigger />,
};

export const MoreConfetti: Story = {
  render: () => {
    const MoreConfettiComponent = () => {
      const [isActive, setIsActive] = useState(false);

      return (
        <div className="ui:flex ui:items-center ui:justify-center ui:min-h-screen">
          <Button
            intent="primary"
            onClick={() => setIsActive(true)}
            disabled={isActive}
          >
            {isActive ? 'Party Time! 🎊' : 'Lots of Confetti'}
          </Button>
          <Confetti
            isActive={isActive}
            onComplete={() => setIsActive(false)}
            count={500}
          />
        </div>
      );
    };
    return <MoreConfettiComponent />;
  },
};

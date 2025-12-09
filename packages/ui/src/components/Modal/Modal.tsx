import { ReactNode } from 'react';

import {
  Modal as AriaModal,
  Dialog,
  ModalOverlay,
} from 'react-aria-components';

import { cx } from 'class-variance-authority';

import { Heading } from '../Heading/Heading';

type ModalProps = {
  isOpen: boolean;
  children: ReactNode;
};

type ModalHeaderProps = {
  children: ReactNode;
  className?: string;
};

type ModalBodyProps = {
  children: ReactNode;
  className?: string;
};

type ModalFooterProps = {
  children: ReactNode;
  className?: string;
};

const ModalHeader = ({ children, className }: ModalHeaderProps) => (
  <div>
    <Heading className={cx(className)} slot="title">
      {children}
    </Heading>
  </div>
);

const ModalBody = ({ children, className }: ModalBodyProps) => (
  <div className={cx(className)}>{children}</div>
);

const ModalFooter = ({ children, className }: ModalFooterProps) => {
  return <div className={cx(className)}>{children}</div>;
};

export const Modal = ({ isOpen, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay
      isOpen={isOpen}
      className="ui:absolute ui:top-0 ui:left-0 ui:w-full ui:h-(--page-height) ui:isolate ui:z-20 ui:bg-black/[50%] ui:text-center"
    >
      <div className="ui:sticky ui:top-0 ui:left-0 ui:w-full ui:h-(--visual-viewport-height) ui:flex ui:items-center ui:justify-center ui:p-4 ui:box-border">
        <AriaModal
          isOpen={isOpen}
          className="ui:w-full ui:max-w-md ui:max-h-full ui:bg-white ui:dark:bg-zinc-800 ui:dark:text-white ui:bg-clip-padding ui:border ui:border-black/10 ui:dark:border-white/10 ui:text-left"
        >
          <Dialog className="ui:p-6">{children}</Dialog>
        </AriaModal>
      </div>
    </ModalOverlay>
  );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

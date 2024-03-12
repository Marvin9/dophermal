import {useState} from 'react';

export const useDisclosure = (initialOpen = false) => {
  const [open, setOpen] = useState(initialOpen);

  return {
    open,
    onOpen: () => setOpen(true),
    onClose: () => setOpen(false),
    toggle: () => setOpen(!open),
  };
};

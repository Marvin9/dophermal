import ContainerIcon from '@ui/assets/container.svg';

export const NotFound = (props: {text?: string}) => (
  <div className="flex w-full h-full items-center justify-center">
    <div>
      <img src={ContainerIcon} alt="container" className="w-96" />
      <h4 className="text-center mt-10 font-light text-lg">
        {props.text || 'No data found.'}
      </h4>
    </div>
  </div>
);

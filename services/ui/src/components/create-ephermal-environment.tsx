import {useForm} from 'react-hook-form';
import {Label} from '@ui/components/shared/ui/label';
import {Input} from '@ui/components/shared/ui/input';
import {Button} from './shared/ui/button';

type EphermalEnvironmentForm = {
  pullImageUrl: string;
  port: number;
};

type CreateEphermalEnvironmentProps = {
  onSubmit(_in: EphermalEnvironmentForm): void;
};

export const CreateEphermalEnvironment = ({
  onSubmit,
}: CreateEphermalEnvironmentProps) => {
  const {register, handleSubmit} = useForm<EphermalEnvironmentForm>();

  const submit = handleSubmit(onSubmit);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="gap-3 flex flex-col">
        <Label htmlFor="pullImageUrl">🐳 Docker Image:</Label>
        <Input
          {...register('pullImageUrl')}
          id="pullImageUrl"
          placeholder="mayursiinh/react-nginx"
        />
      </div>

      <div className="gap-3 flex flex-col my-5">
        <Label htmlFor="port">：Exposed Port number</Label>
        <Input type="number" {...register('port')} placeholder="8000" min="0" />
      </div>

      <Button type="submit">Create</Button>
    </form>
  );
};

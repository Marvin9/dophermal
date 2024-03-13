import {useForm} from 'react-hook-form';
import {Label} from '@ui/components/shared/ui/label';
import {Input} from '@ui/components/shared/ui/input';
import {Button} from './shared/ui/button';
import {PlusCircledIcon, TrashIcon} from '@radix-ui/react-icons';
import {omit} from '@ui/lib/utils';
import {useState} from 'react';

type EphermalEnvironmentForm = {
  pullImageUrl: string;
  port: number;
  keyValueEnv: Record<string, string>;
};

type CreateEphermalEnvironmentProps = {
  onSubmit(_in: EphermalEnvironmentForm): void;
};

export const CreateEphermalEnvironment = ({
  onSubmit,
}: CreateEphermalEnvironmentProps) => {
  const {register, handleSubmit, watch, setValue} =
    useForm<EphermalEnvironmentForm>({
      defaultValues: {
        keyValueEnv: {},
      },
    });

  const submit = handleSubmit(onSubmit);

  const keyValueEnvFieldValue = watch('keyValueEnv');

  const [kv, setKv] = useState(['', '']);

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

      <div className={fieldStyle}>
        <Label htmlFor="port">：Exposed Port number</Label>
        <Input type="number" {...register('port')} placeholder="8000" min="0" />
      </div>

      <div className={fieldStyle}>
        <Label htmlFor="keyValueEnv">🔑 key-value env</Label>
        {Object.entries(keyValueEnvFieldValue).map(([key, value], idx) => {
          return (
            <div
              className="my-2 flex gap-2 items-center"
              key={`${idx}-${key}-${value}`}
            >
              <Input
                value={key}
                onChange={(e) => {
                  const newKey = e.target.value;

                  setValue('keyValueEnv', {
                    ...omit(keyValueEnvFieldValue, [key]),
                    [newKey]: value,
                  });
                }}
              />
              :
              <Input
                value={value}
                onChange={(e) => {
                  setValue('keyValueEnv', {
                    ...keyValueEnvFieldValue,
                    [key]: e.target.value,
                  });
                }}
              />
              <Button type="button" variant="outline">
                <TrashIcon
                  className="text-red-600"
                  onClick={() =>
                    setValue('keyValueEnv', omit(keyValueEnvFieldValue, [key]))
                  }
                />
              </Button>
            </div>
          );
        })}
        <div className="my-2 flex gap-2 items-center">
          <Input
            value={kv[0]}
            onChange={(e) => setKv([e.target.value, kv[1]])}
          />
          :
          <Input
            value={kv[1]}
            onChange={(e) => setKv([kv[0], e.target.value])}
          />
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setValue('keyValueEnv', {
                ...keyValueEnvFieldValue,
                [kv[0]]: kv[1],
              });
            }}
          >
            <PlusCircledIcon />
          </Button>
        </div>
      </div>

      <Button type="submit">Create</Button>
    </form>
  );
};

const fieldStyle = 'flex flex-col gap-3 my-5';

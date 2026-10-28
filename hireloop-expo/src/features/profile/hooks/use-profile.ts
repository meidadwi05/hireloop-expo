import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {profileApi} from '../api/profile.api';
import {profileKeys} from '../profile.keys';

export function useProfile() {
  return useQuery({queryKey: profileKeys.detail(), queryFn: profileApi.get});
}

export function useProfileFiles() {
  return useQuery({queryKey: profileKeys.files(), queryFn: profileApi.listFiles});
}

export function useProfileMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  options: {refreshFiles?: boolean} = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: profileKeys.detail()});
      if (options.refreshFiles) {
        await queryClient.invalidateQueries({queryKey: profileKeys.files()});
      }
    },
  });
}

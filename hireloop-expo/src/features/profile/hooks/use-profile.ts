import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {profileApi} from '../api/profile.api';
import {profileKeys} from '../profile.keys';

export function useProfile() {
  return useQuery({queryKey: profileKeys.detail(), queryFn: profileApi.get});
}

export function useProfileFiles() {
  return useQuery({queryKey: profileKeys.files(), queryFn: profileApi.listFiles});
}

export function useExperiences() {
  return useQuery({queryKey: profileKeys.experiences(), queryFn: profileApi.listExperiences});
}

export function useSkillTools() {
  return useQuery({queryKey: profileKeys.tools(), queryFn: profileApi.listSkillTools});
}

export function useLanguages() {
  return useQuery({queryKey: profileKeys.languages(), queryFn: profileApi.listLanguages});
}

export function useProfileMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  options: {refreshFiles?: boolean; refreshExperiences?: boolean; refreshTools?: boolean; refreshLanguages?: boolean} = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: profileKeys.detail()});
      if (options.refreshFiles) {
        await queryClient.invalidateQueries({queryKey: profileKeys.files()});
      }
      if (options.refreshExperiences) await queryClient.invalidateQueries({queryKey: profileKeys.experiences()});
      if (options.refreshTools) await queryClient.invalidateQueries({queryKey: profileKeys.tools()});
      if (options.refreshLanguages) await queryClient.invalidateQueries({queryKey: profileKeys.languages()});
    },
  });
}

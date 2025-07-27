import _ from 'lodash';

export const removeReference = <T>(value: T): T => {
   return _.cloneDeep(value);
};

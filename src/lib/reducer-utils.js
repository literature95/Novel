/**
 * 通用 Reducer 工具 —— 消除 store.jsx 中大量重复的 ADD / UPDATE / DELETE case
 *
 * 用法：
 *   const crud = createEntityReducer('characters')
 *   case 'ADD_CHARACTER': return finalize(crud.add(state, action))
 */

/**
 * 为标准数组型实体创建 ADD / UPDATE / DELETE 三个 reducer
 * @param {string} stateKey  项目 state 中的字段名（如 'characters', 'locations'）
 * @returns {{ add, update, delete }}
 */
export function createEntityReducer(stateKey) {
  return {
    add(state, action) {
      return {
        ...state,
        [stateKey]: [...(state[stateKey] || []), action.payload],
      }
    },

    update(state, action) {
      const { index, patch } = action.payload
      return {
        ...state,
        [stateKey]: (state[stateKey] || []).map((item, i) =>
          i === index ? { ...item, ...patch } : item
        ),
      }
    },

    delete(state, action) {
      return {
        ...state,
        [stateKey]: (state[stateKey] || []).filter((_, i) => i !== action.payload),
      }
    },
  }
}

/**
 * 批量创建实体 reducer，返回一个大对象可直接展开到 switch 语句
 *
 * 用法：
 *   const entityReducers = createEntityReducers(['characters', 'locations', 'magicSystem', ...])
 *   // entityReducers = { ADD_CHARACTER, UPDATE_CHARACTER, DELETE_CHARACTER, ADD_LOCATIONS, ... }
 *
 * @param {string[]} keys 实体字段名列表
 * @returns {Record<string, Function>}
 */
export function createEntityReducers(keys) {
  const result = {}
  for (const key of keys) {
    const upper = key.replace(/([A-Z])/g, '_$1').toUpperCase()
    const crud = createEntityReducer(key)
    result[`ADD_${upper}`] = (state, action) => crud.add(state, action)
    result[`UPDATE_${upper}`] = (state, action) => crud.update(state, action)
    result[`DELETE_${upper}`] = (state, action) => crud.delete(state, action)
  }
  return result
}
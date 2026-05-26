import { useState, useCallback } from 'react'

/**
 * 通用实体 CRUD Hook —— 替代 store.jsx 中 8 个重复的 editingXxxIdx + add/update/delete 模式
 *
 * 用法：
 *   const crud = useEntityCRUD({
 *     dispatch,
 *     addType: 'ADD_CHARACTER',
 *     updateType: 'UPDATE_CHARACTER',
 *     deleteType: 'DELETE_CHARACTER',
 *     createDefault: (items) => createBlankCharacter(items),
 *     getItems: () => project.characters,
 *     confirmLabel: '该角色',
 *   })
 *   // crud.add() / crud.update(idx, patch) / crud.remove(idx) / crud.editingIdx / crud.setEditingIdx
 *
 * @param {object} options
 * @param {Function} options.dispatch        useReducer 的 dispatch
 * @param {string}   options.addType         添加 action type
 * @param {string}   options.updateType      更新 action type
 * @param {string}   options.deleteType      删除 action type
 * @param {Function} options.createDefault   创建默认实体的工厂函数，签名为 (currentItems) => newItem
 * @param {Function} options.getItems        获取当前实体列表的函数，签名为 () => items[]
 * @param {string}   [options.confirmLabel]  删除确认弹窗中的对象名称，默认 '该项'
 * @returns {{ add, update, remove, editingIdx, setEditingIdx }}
 */
export function useEntityCRUD({
  dispatch,
  addType,
  updateType,
  deleteType,
  createDefault,
  getItems,
  confirmLabel = '该项',
}) {
  const [editingIdx, setEditingIdx] = useState(0)

  const add = useCallback(() => {
    const items = getItems()
    const item = createDefault(items)
    dispatch({ type: addType, payload: item })
    setEditingIdx(items.length)
  }, [dispatch, addType, createDefault, getItems])

  const update = useCallback((index, patch) => {
    dispatch({ type: updateType, payload: { index, patch } })
  }, [dispatch, updateType])

  const remove = useCallback((index) => {
    if (!confirm(`确定删除${confirmLabel}？`)) return
    dispatch({ type: deleteType, payload: index })
    setEditingIdx(i => Math.max(0, i >= index ? i - 1 : i))
  }, [dispatch, deleteType, confirmLabel])

  return { add, update, remove, editingIdx, setEditingIdx }
}
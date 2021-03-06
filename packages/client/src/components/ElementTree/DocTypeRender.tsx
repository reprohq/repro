import { SyntheticId } from '@/types/common'
import { VDocType } from '@/types/vdom'
import { Block } from 'jsxstyle'
import React from 'react'
import colors from 'tailwindcss/colors'
import { useNode } from './context'
import { TreeRow } from './TreeRow'

interface Props {
  depth: number
  nodeId: SyntheticId
}

export const DocTypeNodeRenderer: React.FC<Props> = ({ nodeId, depth }) => {
  const node = useNode<VDocType>(nodeId)

  if (!node) {
    return null
  }

  return (
    <TreeRow nodeId={nodeId} key={nodeId} depth={depth}>
      <Block color={colors.slate['500']}>{`<!DOCTYPE ${node.name}${
        node.publicId && `PUBLIC ${node.publicId}`
      }${node.systemId}>`}</Block>
    </TreeRow>
  )
}

import React, { useEffect, useState } from "react";

const hydrateSelectedItemsList = (
  currentPageData: [],
  globalSelectedItemsList: any
) => {
  const selectedList: any = {};

  currentPageData.forEach((item: any) => {
    if (globalSelectedItemsList[item._id]) {
      selectedList[item._id] = true;
    }
  });
  return selectedList;
};

const SingleLevelSelector = ({ fetchData }) => {
  const [globalSelectedItems, setGlobalSelectedItems] = useState<{
    [key: number]: any;
  }>({});

  const [selectedItems, setSelectedItems] = useState<{
    [key: number]: any;
  }>({});
  const [unselectedItems, setUnselectedItems] = useState<{
    [key: number]: any;
  }>({});
  const [currentRenderingItems, setCurrentRenderingItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState();
  const [selectAll, setSelectAll] = useState<
    "none" | "indeterminate" | "checked"
  >("none");
  const [allSelected, setAllSelected] = useState(false);
  const [listConductor, setListConductor] = useState({
    search: "",
    pagination: {
      size: 10,
      page: 0
    },
    uiState: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>();
  useEffect(() => {
    console.log("called");
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    fetchList(listConductor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listConductor]);

  const fetchList = async (listData: {
    search: string;
    pagination: any;
    uiState?: number;
  }) => {
    try {
      setLoading(true);
      setError(undefined);
      setSelectedItems({});

      const config = {
        params: {
          search: listData.search,
          ...listData.pagination
        }
      };
      const { data } = await fetchData(config);
      setCurrentRenderingItems(data.data);
      setTotalCount(data.totalPassengers);
      setTotalPages(data.totalPages);
      const selectedList = hydrateSelectedItemsList(
        data.data,
        globalSelectedItems
      );
      console.log({ allSelected, unselectedItems });
      if (allSelected) {
        let unselectedList = 0;
        data.data.forEach((item: any) => {
          if (unselectedItems[item._id]) {
            unselectedList++;
          }
        });
        if (unselectedList === 0) {
          setSelectAll("checked");
        } else if (unselectedList === data.data.length) {
          setSelectAll("none");
        } else {
          setSelectAll("indeterminate");
        }
      } else if (Object.keys(selectedList).length === data.data.length) {
        setSelectAll("checked");
      } else if (Object.keys(selectedList).length) {
        setSelectAll("indeterminate");
      } else {
        setSelectAll("none");
      }
      setSelectedItems(selectedList);
      setLoading(false);
    } catch (error) {
      console.log({ error });
      setLoading(false);
      setError(error);
    }
  };

  const onPrev = () => {
    setListConductor((prevObj) => ({
      ...prevObj,
      pagination: {
        ...prevObj.pagination,
        page: prevObj.pagination.page - 1
      }
    }));
  };

  const onNext = () => {
    setListConductor((prevObj) => ({
      ...prevObj,
      pagination: {
        ...prevObj.pagination,
        page: prevObj.pagination.page + 1
      }
    }));
  };

  const onChange = (id: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const status = e.target.checked;
    console.log({ status });
    const currentSelectedCount = Object.keys(selectedItems).length;
    const currentUnselectedCount = Object.keys(unselectedItems).length;
    let unselectedList = { ...unselectedItems };
    let selectedList = { ...selectedItems };
    let copyGlobalSelected = { ...globalSelectedItems };
    let selectAllStatus = selectAll;
    if (status) {
      if (allSelected) {
        if (currentUnselectedCount - 1 === 0) {
          selectAllStatus = "checked";
          selectedList = {};
          unselectedList = {};
          copyGlobalSelected = {};
        } else {
          delete unselectedList[id];
        }
      }

      if (selectAll === "none") {
        if (currentSelectedCount + 1 === currentRenderingItems.length) {
          selectAllStatus = "checked";
        } else {
          selectAllStatus = "indeterminate";
        }
        selectedList[id] = true;
        copyGlobalSelected[id] = true;
      }

      if (selectAll === "indeterminate") {
        if (currentSelectedCount + 1 === currentRenderingItems.length) {
          selectAllStatus = "checked";
        }
        selectedList[id] = true;
        copyGlobalSelected[id] = true;
      }
    } else {
      if (allSelected) {
        if (currentUnselectedCount + 1 === totalCount) {
          selectAllStatus = "none";
          selectedList = {};
          unselectedList = {};
          copyGlobalSelected = {};
        } else {
          unselectedList[id] = true;
        }
      }

      if (selectAll === "checked") {
        if (totalCount === 1) {
          selectAllStatus = "none";
          selectedList = {};
          unselectedList = {};
          copyGlobalSelected = {};
        } else {
          selectAllStatus = "indeterminate";
          delete selectedList[id];
          delete copyGlobalSelected[id];
        }
      } else {
        //if indeterminate
        if (currentSelectedCount - 1 === 0) {
          selectAllStatus = "none";
          selectedList = {};
          unselectedList = {};
          delete copyGlobalSelected[id];
        } else {
          delete selectedList[id];
          delete copyGlobalSelected[id];
        }
      }
    }

    setSelectedItems(selectedList);
    setUnselectedItems(unselectedList);
    setGlobalSelectedItems({ ...copyGlobalSelected });
    setSelectAll(selectAllStatus);
  };

  const selectAllOnCurrentPage = () => {
    let selectedList = { ...selectedItems };
    let unselectedList = { ...unselectedItems };

    currentRenderingItems.forEach((item: any) => {
      if (allSelected) {
        delete unselectedList[item._id];
      } else {
        selectedList[item._id] = true;
      }
    });

    setSelectedItems(selectedList);
    setUnselectedItems(unselectedList);
    setGlobalSelectedItems({ ...globalSelectedItems, ...selectedList });
    setSelectAll("checked");
  };

  const unselectAllOnCurrentPage = () => {
    let unselectedList = { ...unselectedItems };
    let selectedList = { ...selectedItems };
    let copyGlobalSelected = { ...globalSelectedItems };
    currentRenderingItems.forEach((item: any) => {
      if (allSelected) {
        unselectedList[item._id] = true;
      } else {
        delete selectedList[item._id];
        delete copyGlobalSelected[item._id];
      }
    });

    if (Object.keys(unselectedList).length === totalCount) {
      setAllSelected(false);
    }
    setUnselectedItems(unselectedList);
    setSelectedItems(selectedList);
    setGlobalSelectedItems(copyGlobalSelected);
    setSelectAll("none");
  };
  const onSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (selectAll) {
      case "none":
        // setSelectAll("indeterminate");
        // setSelectedItems({});
        selectAllOnCurrentPage();
        // setUnselectedItems({});
        break;
      case "checked":
        // setSelectAll("none");
        // setSelectedItems({});
        // setUnselectedItems({});
        unselectAllOnCurrentPage();
        break;
      case "indeterminate":
        unselectAllOnCurrentPage();

        // setSelectAll("none");
        // setSelectedItems({});
        // setUnselectedItems({});
        break;

      default:
        break;
    }
  };

  console.log({
    currentRenderingItems,
    totalCount,
    totalPages,
    selectedItems,
    unselectedItems,
    selectAll,
    globalSelectedItems,
    allSelected
  });

  const getSelectedItemsCount = () => {
    if (allSelected) {
      return totalCount - Object.keys(unselectedItems).length;
    }

    return Object.keys(globalSelectedItems).length;
    // if (selectAll === "indeterminate") {
    //   if (Object.keys(unselectedItems).length) {
    //     return totalCount - Object.keys(unselectedItems).length;
    //   }
    //   return Object.keys(selectedItems).length;
    // }
  };

  const selectAllItems = () => {
    setAllSelected(true);
    setGlobalSelectedItems({});
    setSelectedItems({});
    setUnselectedItems({});
    setSelectAll("checked");
  };
  const clearAllItems = () => {
    setAllSelected(false);
    setGlobalSelectedItems({});
    setSelectedItems({});
    setUnselectedItems({});
    setSelectAll("none");
  };

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>An error has occured.</p>;
  }

  return currentRenderingItems.length !== 0 ? (
    <>
      <div>
        <label htmlFor="select-all">Select All ({selectAll}) </label>
        <input
          id="select-all"
          type="checkbox"
          checked={selectAll !== "none"}
          onChange={onSelectAll}
        />
        <span>
          {" "}
          <i>{` (${getSelectedItemsCount()} of ${totalCount})`}</i>
        </span>

        {allSelected && !Object.keys(unselectedItems).length ? (
          <button onClick={clearAllItems}>clear all</button>
        ) : null}
        {Object.keys(selectedItems).length ||
        Object.keys(unselectedItems).length ? (
          <button
            onClick={selectAllItems}
          >{`Select all ${totalCount} items`}</button>
        ) : null}
      </div>

      <ul className="itemList">
        {currentRenderingItems.map((item: any) => (
          <li className="item" key={item._id}>
            <input
              type="checkbox"
              checked={isChecked(
                item._id,
                selectedItems,
                selectAll,
                unselectedItems,
                allSelected
              )}
              onChange={onChange(item._id)}
            />{" "}
            {item.name}
          </li>
        ))}
      </ul>
      <div>
        <button disabled={listConductor.pagination.page === 0} onClick={onPrev}>
          Prev
        </button>
        <button
          disabled={listConductor.pagination.page === totalPages}
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </>
  ) : (
    "Nothing to Render yet"
  );
};

const isChecked = (
  id: number,
  selectedItems: { [key: number]: any },
  selectAll: string,
  unselectedItems: { [key: number]: any },
  allSelected
) => {
  if (selectedItems[id]) {
    return true;
  }

  if (allSelected && !unselectedItems[id]) {
    return true;
  }

  // if (selectAll === "indeterminate") {
  //   const unselectedItemsCount = Object.keys(unselectedItems).length;

  //   if (unselectedItemsCount && unselectedItems[id]) {
  //     return false;
  //   }
  //   if (unselectedItemsCount && !selectedItems[id]) {
  //     return true;
  //   }
  //   if (selectedItems[id]) {
  //     return true;
  //   }
  // }
  //   (unselectedItems[id] || selectedItems[id])
  // ) {
  //   return true;
  // }
  return false;
};

export default SingleLevelSelector;
